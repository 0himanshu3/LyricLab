import React, { useState, useEffect } from "react";
import axios from "axios";

const SendMail = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [emailValue, setEmailValue] = useState(""); // Email state
  const [name, setName] = useState(""); // Name state

  useEffect(() => {
    // Generate a 6-digit verification code
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    setVerificationCode(randomCode);
  }, []);

  const registerUser = async (e) => {
    e.preventDefault();
    const userData = {
      name,
      email: emailValue,
      password,
      verificationCode,
    };

    try {
      const response = await axios.post("/api/auth/register", userData);
      console.log("Data sent to backend:", response.data);
      alert("Account created successfully! Please check your email for verification.");
    } catch (error) {
      console.error("Error sending data to backend:", error);
      alert("There was an error creating your account. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-gray-800 rounded-lg shadow-lg">
      <form onSubmit={registerUser} className="flex flex-col gap-4">
        <h2 className="text-center text-2xl font-semibold text-gray-200 mb-4">Sign Up</h2>

        <label className="text-gray-300" htmlFor="name">Username</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="p-3 rounded border border-gray-500 bg-gray-700 text-gray-200 focus:border-blue-500 outline-none"
        />

        <label className="text-gray-300" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={emailValue}
          onChange={(e) => setEmailValue(e.target.value)}
          placeholder="Enter your email"
          className="p-3 rounded border border-gray-500 bg-gray-700 text-gray-200 focus:border-blue-500 outline-none"
        />

        <label className="text-gray-300" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="p-3 rounded border border-gray-500 bg-gray-700 text-gray-200 focus:border-blue-500 outline-none"
        />

        <button
          type="submit"
          className="bg-blue-600 text-gray-100 font-bold p-3 rounded transition-colors hover:bg-blue-700"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SendMail;
