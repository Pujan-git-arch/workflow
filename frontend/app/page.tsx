"use client";

import { useEffect, useState } from "react";

import api from "../lib/axios";

export default function Home() {
  const [message, setMessage] = useState("Testing connection...");

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await api.get("/health");

        setMessage(JSON.stringify(response.data));
      } catch (error) {
        console.error(error);
        setMessage("Backend connection failed");
      }
    };

    testConnection();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div>
        <h1 className="text-2xl font-bold">
          WorkFlow
        </h1>

        <p className="mt-4">
          Backend response: {message}
        </p>
      </div>
    </main>
  );
};