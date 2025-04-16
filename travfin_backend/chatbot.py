# import os
# from langgraph.graph import StateGraph, END
# from langchain_core.messages import HumanMessage, AIMessage
# from langchain_core.prompts import ChatPromptTemplate
# from langchain_core.runnables.graph import MermaidDrawMethod
# from IPython.display import display, Image

# from dataclasses import dataclass
# from typing_extensions import TypedDict, Annotated
# from typing import Union, List

# @dataclass
# class TripDates:
#     start_date: str
#     duration: int

# class PlannerState(TypedDict):
#     messages: Annotated[List[Union[HumanMessage, AIMessage]], "the messages in the conversation"]
#     city: str
#     interests: List[str]
#     trip_dates: TripDates

#     from langchain_groq import ChatGroq
# llm = ChatGroq(
#     temperature = 0,
#     groq_api_key = "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",
#     model_name = "llama-3.3-70b-versatile"
# )

# result=llm.invoke("What is FR car")
# result.content

# itinerary_prompt = ChatPromptTemplate.from_messages([
#     ("system", "I want you to act as a travel itinerary planner. I will provide you with specific details about my trip, including the destination {city}, my {interests}. You have to lookout for on the internet weather conditions, and any events happening during my visit and  Based on all this information, create a detailed itinerary that includes:1. **Schedule of Activities:**  - A brief, bulleted schedule of activities tailored to my interests.  - Include must-see places nearby and optimize the order of activities for efficient travel, minimum expenditure, and maximum enjoyment.  2. **Transportation Details:**  - List all possible means of transport between locations (e.g., walking, public transport, taxis/rideshare services like OLA/Uber).  - Provide accurate distances between locations and estimated costs for each mode of transport.  - Include direct booking links for transportation services wherever applicable.  3. **Accommodation Recommendations:**  - Suggest nearby hotels or accommodations based on convenience and budget.  - Include booking links and estimated costs per night.  4. **Dining Options:**  - Recommend restaurants or cafes near each activity location.  - Include estimated food costs and links to menus or reservation platforms if available.  5. **Additional Recommendations:**  - Suggest popular activities or attractions in the area that align with my interests.  - Incorporate local events happening during my travel dates if relevant.6. **Weather Considerations:**  - Provide advice on how weather conditions might impact the itinerary and suggest alternatives if needed.7. **Google Maps Integration:**  - Use Google Maps to optimize travel routes and provide links to maps for easy navigation.Please ensure the itinerary is well-organized for convenience and includes all relevant links for bookings."),
#     ("human", "Create an itinerary for my day trip."),
# ])



# def input_city(state: PlannerState) -> PlannerState:
#   print("Please enter the city you want to visit for your day trip: ")
#   user_message = input("Your Input: ")
#   return {
#       **state,
#       "city": user_message,
#       "messages": state['messages'] + [HumanMessage(content=user_message)]
#   }


# def input_interest(state: PlannerState) -> PlannerState:
#   print(f"Please enter your interest for the trip to : {state['city']} (comma-separted): ")
#   user_message = input("Your Input: ")
#   return {
#       **state,
#       "interests": [interest.strip() for interest in user_message.split(",")],
#       "messages": state['messages'] + [HumanMessage(content=user_message)]
#   }

# def input_trip_dates(state: PlannerState) -> PlannerState:
#     print("Please enter the start date for your trip (YYYY-MM-DD): ")
#     start_date = input("Your Input: ")
    
#     print("Please enter the duration of your trip (in days): ")
#     while True:
#         try:
#             duration = int(input("Your Input: "))
#             if duration <= 0:
#                 print("Duration must be a positive integer.")
#                 continue
#             break
#         except ValueError:
#             print("Invalid input. Please enter a number.")
    
#     user_message = f"Trip from {start_date} for {duration} days"
    
#     return {
#         **state,
#         "trip_dates": {"start_date": start_date, "duration": duration},
#         "messages": state['messages'] + [HumanMessage(content=user_message)]
#     }


# def create_itinerary(state: PlannerState) -> PlannerState:
#   print(f"Creating an itinerary for {state['city']} based on interests : {', '.join(state['interests'])}")
#   response = llm.invoke(itinerary_prompt.format_messages(city = state['city'], interests = ','.join(state['interests'])))
#   print("\nFinal Itinerary: ")
#   print(response.content)
#   return {
#       **state,
#       "messages": state['messages'] + [AIMessage(content=response.content)],
#       "itinerary" : response.content,
#   }


# workflow = StateGraph(PlannerState)

# workflow.add_node("input_city", input_city)
# workflow.add_node("input_interest", input_interest)
# workflow.add_node("input_trip_dates", input_trip_dates)
# workflow.add_node("create_itinerary", create_itinerary)

# workflow.set_entry_point("input_city")

# workflow.add_edge("input_city", "input_interest")
# workflow.add_edge("input_interest", "input_trip_dates")
# workflow.add_edge("input_trip_dates", "create_itinerary")
# workflow.add_edge("create_itinerary", END)

# app = workflow.compile()


# import requests

# response = requests.get("https://mermaid.ink/img/your_graph", timeout=60)

# display(
#     Image(
#         app.get_graph().draw_mermaid_png(
#             draw_method = MermaidDrawMethod.API
#         )
#     )
# )



# def travel_planner(user_request: str):
#     print(f"Initial Request: {user_request}\n")
#     state = {
#         "messages": [HumanMessage(content=user_request)],
#         "city": "",
#         "interests": [],
#         "trip_dates": {},
#         "itinerary": "",
#     }
#     for output in app.stream(state):
#         pass



#     user_request = "I want to plan a day trip"
# travel_planner(user_request)































import os
import re
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from dataclasses import dataclass
from typing import Union, List, Dict, Any, Optional
from typing_extensions import TypedDict, Annotated
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

app = Flask(__name__)
# Configure CORS for React development server
# Replace the existing CORS configuration with:
CORS(app, resources={
    r"/api/*": {"origins": "http://localhost:3000"},
    r"/init": {"origins": "http://localhost:3000"},
    r"/update": {"origins": "http://localhost:3000"}
})

# Define data structures
@dataclass
class TripDates:
    start_date: str
    duration: int

class PlannerState(TypedDict):
    messages: Annotated[List[Union[HumanMessage, AIMessage]], "the messages in the conversation"]
    city: Optional[str]
    interests: List[str]
    trip_dates: Optional[Dict[str, Any]]
    current_step: str
    itinerary: Optional[str]

# Initialize Groq LLM with environment variable
llm = ChatGroq(
    temperature=0,
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama3-70b-8192"
)

# Define the travel itinerary prompt
itinerary_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful travel itinerary planner. Create a detailed day-by-day itinerary based on the user's input."),
    ("human", "Create an itinerary for my trip to {city} with these interests: {interests}. Trip dates: {start_date} for {duration} days."),
])

# Helper functions
def is_valid_date(date_str: str) -> bool:
    """Check if the date string is in YYYY-MM-DD format."""
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
        return True
    except ValueError:
        return False

def parse_duration(duration_str: str) -> Optional[int]:
    """Extract the first integer value from a string."""
    match = re.search(r'\d+', duration_str)
    return int(match.group()) if match else None

# Define the workflow nodes
# Modify all state updates to store message dictionaries instead of objects

def set_city(state: PlannerState, city: str) -> PlannerState:
    return {
        **state,
        "city": city,
        "messages": state['messages'] + [HumanMessage(content=f"City: {city}").dict()],
        "current_step": "interests"
    }

def set_interests(state: PlannerState, interests: str) -> PlannerState:
    interest_list = [interest.strip() for interest in interests.split(",")]
    return {
        **state,
        "interests": interest_list,
        "messages": state['messages'] + [HumanMessage(content=f"Interests: {interests}").dict()],
        "current_step": "trip_dates"
    }

def set_trip_dates(state: PlannerState, start_date: str, duration: int) -> PlannerState:
    user_message = f"Trip from {start_date} for {duration} days"
    return {
        **state,
        "trip_dates": {"start_date": start_date, "duration": duration},
        "messages": state['messages'] + [HumanMessage(content=user_message).dict()],
        "current_step": "create_itinerary"
    }

def create_itinerary(state: PlannerState) -> PlannerState:
    try:
        response = llm.invoke(itinerary_prompt.format_messages(
            city=state['city'], 
            interests=','.join(state['interests']),
            start_date=state['trip_dates']['start_date'],
            duration=state['trip_dates']['duration']
        ))
        
        return {
            **state,
            "messages": state['messages'] + [AIMessage(content=response.content).dict()],
            "itinerary": response.content,
            "current_step": "complete"
        }
    except Exception as e:
        return {
            **state,
            "messages": state['messages'] + [AIMessage(content=f"Error creating itinerary: {str(e)}").dict()],
            "current_step": "error"
        }

# Update the init_session function
def init_session():
    return {
        "messages": [],
        "city": None,
        "interests": [],
        "trip_dates": None,
        "current_step": "city",
        "itinerary": None
    }

# API Routes
@app.route('/init', methods=['POST'])
def initialize_session():
    session_state = init_session()
    return jsonify({
        "state": session_state,
        "message": "What city would you like to visit for your trip?"
    })

@app.route('/update', methods=['POST'])
def update_session():
    data = request.json
    current_state = data.get('state', init_session())
    user_input = data.get('user_input', '').strip()
    
    try:
        if current_state['current_step'] == 'city':
            new_state = set_city(current_state, user_input)
            return jsonify({
                "state": new_state,
                "message": "Please enter your interests for this trip (comma-separated):"
            })
        
        elif current_state['current_step'] == 'interests':
            new_state = set_interests(current_state, user_input)
            return jsonify({
                "state": new_state,
                "message": "Please enter the start date (YYYY-MM-DD) for your trip:"
            })
        
        elif current_state['current_step'] == 'trip_dates':
            # Check if input contains both date and duration
            if 'for' in user_input and any(char.isdigit() for char in user_input):
                parts = user_input.split("for")
                start_date = parts[0].strip()
                duration_str = parts[1].strip()
                duration = parse_duration(duration_str)
                if not duration:
                    raise ValueError("Invalid duration format")
                
                if not is_valid_date(start_date):
                    return jsonify({
                        "state": current_state,
                        "message": "Invalid date format. Please enter start date (YYYY-MM-DD):"
                    })
                
                new_state = set_trip_dates(current_state, start_date, duration)
                final_state = create_itinerary(new_state)
                return jsonify({
                    "state": final_state,
                    "message": "Here's your travel itinerary:",
                    "itinerary": final_state.get("itinerary")
                })
            else:
                # Check if we're expecting duration
                if current_state.get('trip_dates') and 'start_date' in current_state['trip_dates']:
                    duration = parse_duration(user_input)
                    if not duration:
                        return jsonify({
                            "state": current_state,
                            "message": "Please enter a valid number of days for the duration:"
                        })
                    
                    start_date = current_state['trip_dates']['start_date']
                    new_state = set_trip_dates(current_state, start_date, duration)
                    final_state = create_itinerary(new_state)
                    return jsonify({
                        "state": final_state,
                        "message": "Here's your travel itinerary:",
                        "itinerary": final_state.get("itinerary")
                    })
                else:
                    # Validate start date format
                    if is_valid_date(user_input):
                        new_state = {
                            **current_state,
                            "trip_dates": {"start_date": user_input},
                            "messages": current_state['messages'] + [HumanMessage(content=f"Start Date: {user_input}")]
                        }
                        return jsonify({
                            "state": new_state,
                            "message": "Please enter the duration of your trip (in days):"
                        })
                    else:
                        return jsonify({
                            "state": current_state,
                            "message": "Invalid date format. Please enter start date (YYYY-MM-DD):"
                        })
        
        elif current_state['current_step'] == 'create_itinerary':
            final_state = create_itinerary(current_state)
            return jsonify({
                "state": final_state,
                "message": "Here's your travel itinerary:",
                "itinerary": final_state.get("itinerary")
            })
            
    except ValueError as ve:
        return jsonify({
            "state": current_state,
            "message": f"Invalid input: {str(ve)}",
            "error": True
        })
    except Exception as e:
        return jsonify({
            "state": current_state,
            "message": f"Error processing request: {str(e)}",
            "error": True
        })

    return jsonify({
        "state": current_state,
        "message": "Invalid step. Please restart the process.",
        "error": True
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)