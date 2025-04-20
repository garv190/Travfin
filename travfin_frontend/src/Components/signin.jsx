import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Example() {
  const [formdata, setformdata] = useState({ email: "", password: "" });
  //eslint-disable-next-line
  const [message, setMessage] = useState(""); // Correctly destructured
  //eslint-disable-next-line
  const [user, setUser] = useState({ name: "", e: "" }); // Correctly destructured

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formdata.email || !formdata.password) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/signin`, {
        method: "POST",
        credentials: "include", // ✅ Includes cookies
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formdata),
      });

      const data = await response.json();
      if (data.success) {
        setUser({ name: data.user1, e: data.detail1 }); // ✅ Save user details in state
        navigate("/"); // ✅ Redirect to Dashboard after login
        alert(data.message);
      } else {
        setMessage(data.message);
        alert(data.message);
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-slate-600">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm ">
          <img alt="Trafin" src="tvl.png" className="mx-auto h-10 w-auto" />
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="border-2 border-gray-300 rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formdata.email}
                    required
                    autoComplete="email"
                    onChange={(e) =>
                      setformdata({ ...formdata, email: e.target.value })
                    }
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm/6 font-medium text-gray-900"
                  >
                    Password
                  </label>

                  <div className="text-sm">
                    <Link
                      to="/forgotpassword"
                      className="font-semibold text-indigo-600 hover:text-indigo-500"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formdata.password}
                    required
                    onChange={(e) =>
                      setformdata({ ...formdata, password: e.target.value })
                    }
                    autoComplete="current-password"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}