import React, { useRef, useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import styled from "styled-components";
import axios from "axios"; // Add axios for making backend requests

let str = "";

const SendMail = () => {
  const form = useRef();
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [emailValue, setEmailValue] = useState(""); // State for email
  const [name, setName] = useState(""); // State for name

  useEffect(() => {
    // Generate a 6-digit random number and set it as the verification code
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    setVerificationCode(randomCode);
    str = randomCode.toString(); // Convert the number to a string
  }, []);

  const sendEmail = (e) => {
    e.preventDefault();

    console.log(form.current);

    // Send the email using EmailJS
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
            name: name, // Use name state
            email: emailValue, // Use emailValue directly
            password: password, // Password from state
            verificationCode: str, // Verification code generated
          };

          // Send POST request to backend API
          axios
            .post("/api/auth/register", userData) // Replace with your backend endpoint
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
    <StyledContactForm>
      <form ref={form} onSubmit={sendEmail}>
        <label>Username</label>
        <input
          type="text"
          name="user_name"
          value={name} // Bind the name input to name state
          onChange={(e) => setName(e.target.value)} // Update name when input changes
        />
        <label>Email</label>
        <input
          type="email"
          name="user_email"
          value={emailValue} // Bind the email input to emailValue state
          onChange={(e) => setEmailValue(e.target.value)} // Update emailValue when input changes
        />
        {/* Password input (this will not be sent with the email) */}
        <label>Password</label>
        <input
          type="password"
          name="user_password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {/* Hidden message input with default value as the verification code */}
        <textarea
          name="message"
          defaultValue={`${str}`}
          style={{ display: "none" }} // Hide this textarea from the user
        />
        <input type="submit" value="Send" />
      </form>
    </StyledContactForm>
  );
};

export default SendMail;

// Styles
const StyledContactForm = styled.div`
  width: 400px;

  form {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    width: 100%;
    font-size: 16px;

    input {
      width: 100%;
      height: 35px;
      padding: 7px;
      outline: none;
      border-radius: 5px;
      border: 1px solid rgb(220, 220, 220);
      color: black;

      &:focus {
        border: 2px solid rgba(0, 206, 158, 1);
      }
    }

    textarea {
      color: black;
      max-width: 100%;
      min-width: 100%;
      width: 100%;
      max-height: 100px;
      min-height: 100px;
      padding: 7px;
      outline: none;
      border-radius: 5px;
      border: 1px solid rgb(220, 220, 220);

      &:focus {
        border: 2px solid rgba(0, 206, 158, 1);
      }
    }

    label {
      margin-top: 1rem;
    }

    input[type="submit"] {
      margin-top: 2rem;
      cursor: pointer;
      background: rgb(249, 105, 14);
      color: white;
      border: none;
    }
  }
`;
