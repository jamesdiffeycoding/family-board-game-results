import Card from "../components/Card";
import { supabase } from "../supabase-client";
import { useEffect, useState } from "react";

type Player = {
  id: number;
  name: string;
};

type Corporation = {
  id: number;
  name: string;
};

type PlayerScore = {
  id: number;
  score: number;
  corporationId: number;
  blackCubesLeft: number;
};

export default function NewMatch() {
  const [isToday, setIsToday] = useState(true);
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [playerData, setPlayerData] = useState<Player[] | null>(null);
  const [corporations, setCorporations] = useState<Corporation[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlayerScores, setSelectedPlayerScores] = useState<
    PlayerScore[]
  >([]);
  const [showWarning, setShowWarning] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: players, error: playerError } = await supabase
        .from("tm_people")
        .select("id, name");
      if (playerError) {
        console.error(playerError);
      } else {
        setPlayerData(players || []);
      }

      const { data: corps, error: corpError } = await supabase
        .from("tm_corporations")
        .select("id, name");
      if (corpError) {
        console.error(corpError);
      } else {
        setCorporations(corps || []);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const togglePlayer = (id: number) => {
    const defaultCorpId = corporations?.[0]?.id || 1; // fallback
    setSelectedPlayerScores((prev) => {
      const exists = prev.find((p) => p.id === id);
      if (exists) return prev.filter((p) => p.id !== id);

      if (prev.length >= 5) {
        setShowWarning(true);
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return prev;
      }

      setShowWarning(false);
      return [
        ...prev,
        { id, score: 20, corporationId: defaultCorpId, blackCubesLeft: 0 },
      ];
    });
  };

  const handleScoreChange = (id: number, newScore: number) => {
    setSelectedPlayerScores((prev) =>
      prev.map((p) => (p.id === id ? { ...p, score: newScore } : p))
    );
  };

  const handleCorporationChange = (id: number, newCorpId: number) => {
    setSelectedPlayerScores((prev) =>
      prev.map((p) => (p.id === id ? { ...p, corporationId: newCorpId } : p))
    );
  };

  const handleBlackCubesChange = (id: number, value: number) => {
    const clamped = Math.max(0, Math.min(10, value));
    setSelectedPlayerScores((prev) =>
      prev.map((p) => (p.id === id ? { ...p, blackCubesLeft: clamped } : p))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerScores.length) return;

    try {
      const { data: matchData, error: matchError } = await supabase
        .from("tm_matches")
        .insert([{}])
        .select()
        .single();

      if (matchError || !matchData) {
        console.error("Error creating match:", matchError);
        return;
      }

      const matchId = matchData.id;

      const scoresToInsert = selectedPlayerScores.map((player) => ({
        match_id: matchId,
        person_id: player.id,
        points: player.score,
        corporation_id: player.corporationId,
        black_cubes_left: player.blackCubesLeft,
        ranking: 1,
      }));

      const { data: scoresData, error: scoresError } = await supabase
        .from("tm_scores")
        .insert(scoresToInsert);

      if (scoresError) {
        console.error("Error inserting scores:", scoresError);
      } else {
        console.log("Scores inserted successfully:", scoresData);
        setSelectedPlayerScores([]);
        setIsToday(true);
        setDate(new Date().toISOString().slice(0, 10));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const ShowWarning = () => (
    <p className="mb-2 text-red-500 font-semibold">
      You can only select up to 5 players!
    </p>
  );

  return (
    <Card title="New match">
      <form onSubmit={handleSubmit}>
        {/* Date Selector */}
        <div className="flex flex-col justify-between w-full mb-4">
          <label htmlFor="date">Date</label>
          {isToday ? (
            <button
              type="button"
              onClick={() => setIsToday(false)}
              className="mt-2 px-3 py-1 rounded border"
            >
              Not today
            </button>
          ) : (
            <input
              name="date"
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-2 px-3 py-2 rounded border"
            />
          )}
        </div>

        {/* Player Selector */}
        <h1 className="mb-2 font-bold text-xl">Who played?</h1>
        {loading && <p>Loading players...</p>}
        {!loading && playerData && (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {playerData.map((player) => {
                const isSelected = selectedPlayerScores.find(
                  (p) => p.id === player.id
                );
                return (
                  <span
                    key={player.id}
                    onClick={() => togglePlayer(player.id)}
                    className={`cursor-pointer px-3 py-1 rounded-full border transition-all duration-200 ${
                      isSelected ? "bg-green-500 text-white" : "border-gray-400"
                    } ${shake && !isSelected ? "shake" : ""}`}
                  >
                    {player.name}
                  </span>
                );
              })}
            </div>
            {showWarning && <ShowWarning />}
          </>
        )}

        {/* Score, Corporation, Black Cubes Inputs */}
        {selectedPlayerScores.length > 0 && corporations && (
          <div className="flex flex-col gap-2 mb-4">
            {selectedPlayerScores.map((player) => {
              const playerInfo = playerData?.find((p) => p.id === player.id);
              return (
                <div key={player.id} className="flex items-center gap-2">
                  <span>{playerInfo?.name}</span>

                  <input
                    type="number"
                    value={player.score}
                    min={0}
                    onChange={(e) =>
                      handleScoreChange(player.id, Number(e.target.value))
                    }
                    className="px-2 py-1 rounded border w-20"
                  />

                  <select
                    value={player.corporationId}
                    onChange={(e) =>
                      handleCorporationChange(player.id, Number(e.target.value))
                    }
                    className="px-2 py-1 rounded border"
                  >
                    {corporations.map((corp) => (
                      <option key={corp.id} value={corp.id}>
                        {corp.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={player.blackCubesLeft}
                    min={0}
                    max={10}
                    onChange={(e) =>
                      handleBlackCubesChange(player.id, Number(e.target.value))
                    }
                    className="px-2 py-1 rounded border w-20"
                  />
                </div>
              );
            })}
          </div>
        )}

        <button
          type="submit"
          className="mt-4 px-4 py-2 rounded bg-blue-500 text-white"
        >
          Submit Match
        </button>
      </form>
    </Card>
  );
}
