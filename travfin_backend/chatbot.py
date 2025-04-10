import os
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables.graph import MermaidDrawMethod
from IPython.display import display, Image

from dataclasses import dataclass
from typing_extensions import TypedDict, Annotated
from typing import Union, List

@dataclass
class TripDates:
    start_date: str
    duration: int

class PlannerState(TypedDict):
    messages: Annotated[List[Union[HumanMessage, AIMessage]], "the messages in the conversation"]
    city: str
    interests: List[str]
    trip_dates: TripDates

    from langchain_groq import ChatGroq
llm = ChatGroq(
    temperature = 0,
    
    model_name = "llama-3.3-70b-versatile"
)

result=llm.invoke("What is FR car")
result.content

itinerary_prompt = ChatPromptTemplate.from_messages([
    ("system", "I want you to act as a travel itinerary planner. I will provide you with specific details about my trip, including the destination {city}, my {interests}. You have to lookout for on the internet weather conditions, and any events happening during my visit and  Based on all this information, create a detailed itinerary that includes:1. **Schedule of Activities:**  - A brief, bulleted schedule of activities tailored to my interests.  - Include must-see places nearby and optimize the order of activities for efficient travel, minimum expenditure, and maximum enjoyment.  2. **Transportation Details:**  - List all possible means of transport between locations (e.g., walking, public transport, taxis/rideshare services like OLA/Uber).  - Provide accurate distances between locations and estimated costs for each mode of transport.  - Include direct booking links for transportation services wherever applicable.  3. **Accommodation Recommendations:**  - Suggest nearby hotels or accommodations based on convenience and budget.  - Include booking links and estimated costs per night.  4. **Dining Options:**  - Recommend restaurants or cafes near each activity location.  - Include estimated food costs and links to menus or reservation platforms if available.  5. **Additional Recommendations:**  - Suggest popular activities or attractions in the area that align with my interests.  - Incorporate local events happening during my travel dates if relevant.6. **Weather Considerations:**  - Provide advice on how weather conditions might impact the itinerary and suggest alternatives if needed.7. **Google Maps Integration:**  - Use Google Maps to optimize travel routes and provide links to maps for easy navigation.Please ensure the itinerary is well-organized for convenience and includes all relevant links for bookings."),
    ("human", "Create an itinerary for my day trip."),
])



def input_city(state: PlannerState) -> PlannerState:
  print("Please enter the city you want to visit for your day trip: ")
  user_message = input("Your Input: ")
  return {
      **state,
      "city": user_message,
      "messages": state['messages'] + [HumanMessage(content=user_message)]
  }


def input_interest(state: PlannerState) -> PlannerState:
  print(f"Please enter your interest for the trip to : {state['city']} (comma-separted): ")
  user_message = input("Your Input: ")
  return {
      **state,
      "interests": [interest.strip() for interest in user_message.split(",")],
      "messages": state['messages'] + [HumanMessage(content=user_message)]
  }

def input_trip_dates(state: PlannerState) -> PlannerState:
    print("Please enter the start date for your trip (YYYY-MM-DD): ")
    start_date = input("Your Input: ")
    
    print("Please enter the duration of your trip (in days): ")
    while True:
        try:
            duration = int(input("Your Input: "))
            if duration <= 0:
                print("Duration must be a positive integer.")
                continue
            break
        except ValueError:
            print("Invalid input. Please enter a number.")
    
    user_message = f"Trip from {start_date} for {duration} days"
    
    return {
        **state,
        "trip_dates": {"start_date": start_date, "duration": duration},
        "messages": state['messages'] + [HumanMessage(content=user_message)]
    }


def create_itinerary(state: PlannerState) -> PlannerState:
  print(f"Creating an itinerary for {state['city']} based on interests : {', '.join(state['interests'])}")
  response = llm.invoke(itinerary_prompt.format_messages(city = state['city'], interests = ','.join(state['interests'])))
  print("\nFinal Itinerary: ")
  print(response.content)
  return {
      **state,
      "messages": state['messages'] + [AIMessage(content=response.content)],
      "itinerary" : response.content,
  }


workflow = StateGraph(PlannerState)

workflow.add_node("input_city", input_city)
workflow.add_node("input_interest", input_interest)
workflow.add_node("input_trip_dates", input_trip_dates)
workflow.add_node("create_itinerary", create_itinerary)

workflow.set_entry_point("input_city")

workflow.add_edge("input_city", "input_interest")
workflow.add_edge("input_interest", "input_trip_dates")
workflow.add_edge("input_trip_dates", "create_itinerary")
workflow.add_edge("create_itinerary", END)

app = workflow.compile()


import requests

response = requests.get("https://mermaid.ink/img/your_graph", timeout=60)

display(
    Image(
        app.get_graph().draw_mermaid_png(
            draw_method = MermaidDrawMethod.API
        )
    )
)



def travel_planner(user_request: str):
    print(f"Initial Request: {user_request}\n")
    state = {
        "messages": [HumanMessage(content=user_request)],
        "city": "",
        "interests": [],
        "trip_dates": {},
        "itinerary": "",
    }
    for output in app.stream(state):
        pass



    user_request = "I want to plan a day trip"
travel_planner(user_request)