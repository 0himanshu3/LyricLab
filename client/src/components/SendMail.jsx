import React, { useRef, useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import styled from "styled-components";
import axios from "axios";

let str = "";

const SendMail = () => {
  const form = useRef();
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [emailValue, setEmailValue] = useState(""); // State for email
  const [name, setName] = useState(""); // State for name

  useEffect(() => {
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    setVerificationCode(randomCode);
    str = randomCode.toString(); // Convert the number to a string
  }, []);

  const sendEmail = (e) => {
    e.preventDefault();

    console.log(form.current);

    emailjs
      .sendForm(
        import.meta.env.VITE_SERVICE_ID,
        import.meta.env.VITE_TEMPLATE_ID,
        form.current,
        import.meta.env.VITE_USER_ID
      )
      .then(
        (result) => {
          console.log(result.text);
          console.log("Message sent");

          const userData = {
            name: name,
            email: emailValue,
            password: password,
            verificationCode: str,
          };

          axios
            .post("/api/auth/register", userData)
            .then((response) => {
              console.log("Data sent to backend:", response.data);
            })
            .catch((error) => {
              console.log("Error sending data to backend:", error);
            });
        },
        (error) => {
          console.log(error.text);
        }
      );
  };

  return (
    <StyledContactForm className="bg-slate-950">
      <form ref={form} onSubmit={sendEmail}>
        <h2 className="text-center text-2xl text-gray-200 font-semibold mb-2">Sign Up</h2>
        <label className="text-gray-200">Username</label>
        <input
          type="text"
          name="user_name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
        <label className="text-gray-200">Email</label>
        <input
          type="email"
          name="user_email"
          value={emailValue}
          onChange={(e) => setEmailValue(e.target.value)}
          placeholder="Enter your email"
        />
        <label className="text-gray-200">Password</label>
        <input
          type="password"
          name="user_password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
        <textarea
          name="message"
          defaultValue={`${str}`}
          style={{ display: "none" }}
        />
        <input type="submit" value="Send" />
      </form>
    </StyledContactForm>
  );
};

export default SendMail;

// Styles
const StyledContactForm = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 10px;
  background-color: #2e2e2e;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  label {
    font-size: 1rem;
    color: #cbd5e1;
  }

  input, textarea {
    font-size: 1rem;
    padding: 0.75rem;
    border-radius: 5px;
    border: 1px solid #4a5568;
    outline: none;
    background-color: #1a202c;
    color: #e2e8f0;

    &:focus {
      border: 1px solid #63b3ed;
    }
  }

  input[type="submit"] {
    background-color: #3182ce;
    color: gray-200;
    font-weight: bold;
    cursor: pointer;
    border: none;
    padding: 0.75rem;
    border-radius: 5px;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #2b6cb0;
    }
  }
`;
