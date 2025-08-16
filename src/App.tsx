import "./App.css";
import { supabase } from "./supabase-client";
import { useEffect, useState } from "react";

function App() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPeople = async () => {
      let { data: people, error } = await supabase
        .from("tm_people") // 👈 replace with your table name
        .select("*"); // select all columns

      if (error) {
        console.error(error);
      } else {
        setPeople(people);
      }
      setLoading(false);
    };

    fetchPeople();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Data from Supabase</h1>
      <ul>
        {people.map((item) => (
          <li key={item.id}>{JSON.stringify(item)}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
