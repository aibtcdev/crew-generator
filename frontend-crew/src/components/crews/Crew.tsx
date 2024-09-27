import React, { useState } from "react";
import { supabaseBrowswerClient } from "@/helpers/supabase-client";

const Crew = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Function to handle the insert into Supabase
  const createCrew = async () => {
    setLoading(true);
    setMessage("");

    try {
      // Step 1: Get the logged-in user's ID from Supabase Auth
      const { data: user, error: userError } =
        await supabaseBrowswerClient.auth.getUser();
      if (userError) throw userError;

      const userId = user?.user?.id; // User's ID from Supabase Auth

      // Step 2: Query the 'profiles' table to get the corresponding profile_id
      const { data: profileData, error: profileError } =
        await supabaseBrowswerClient
          .from("profiles")
          .select("id") // Select the profile ID
          .eq("id", userId) // Match user_id from the profiles table
          .single(); // Since we expect a 1-to-1 mapping between profiles and users

      if (profileError) throw profileError;

      const profile_id = profileData?.id; // Extract the profile_id from the result

      // Step 3: Insert the crew with the name and profile_id
      const { data, error } = await supabaseBrowswerClient
        .from("crews")
        .insert({ name, profile_id });

      if (error) {
        throw error;
      }

      // On success
      setMessage("Crew created successfully!");
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create a Crew</h1>
      <input
        type="text"
        placeholder="Enter crew name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={createCrew} disabled={loading}>
        {loading ? "Creating..." : "Create Crew"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
};

export default Crew;
