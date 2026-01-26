import { useEffect, useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

const API = "http://localhost:5000/api";
const AUTH_API = "http://localhost:5000/auth";

function App() {

  const [user, setUser] = useState<any>(null);

  const [scheduled, setScheduled] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState("scheduled");
  const [loading, setLoading] = useState(false);

  const [selectedEmail, setSelectedEmail] = useState<any>(null);

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [time, setTime] = useState("");

  // --------- Format Scheduled Time ----------
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  // --------- Load Session ----------
  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  // --------- Load Emails ----------
  useEffect(() => {
    if (user?.id) {
      loadEmails();
    }
  }, [user]);

  const loadEmails = async () => {

    try {
      setLoading(true);

      const scheduledRes = await axios.get(
        `${API}/scheduled/${user.id}`
      );

      const sentRes = await axios.get(
        `${API}/sent/${user.id}`
      );

      setScheduled(scheduledRes.data);
      setSent(sentRes.data);

    } catch (err) {
      console.error("Load emails error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --------- Schedule Email ----------
  const scheduleEmail = async () => {

    if (!to || !subject || !time) {
      alert("Please fill required fields");
      return;
    }

    await axios.post(`${API}/schedule`, {
      to,
      subject,
      body,
      scheduledTime: new Date(time).toISOString(),
      userId: user.id
    });

    setTo("");
    setSubject("");
    setBody("");
    setTime("");

    loadEmails();
  };

  // --------- Logout ----------
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  // --------- Login UI ----------
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">

        <div className="bg-slate-800 p-10 rounded-xl shadow-xl w-[360px] text-center">

          <h1 className="text-3xl font-bold text-white mb-2">
            ReachInbox
          </h1>

          <p className="text-gray-400 mb-6">
            Email Scheduler Platform
          </p>

          <GoogleLogin
            onSuccess={async (cred) => {

              const res = await axios.post(
                `${AUTH_API}/google`,
                { token: cred.credential }
              );

              localStorage.setItem("user", JSON.stringify(res.data));
              setUser(res.data);
            }}
            onError={() => alert("Google Login Failed")}
          />

        </div>

      </div>
    );
  }

  // --------- Dashboard ----------
  return (
    <div className="min-h-screen bg-slate-900 text-white">

      {/* Navbar */}
      <div className="flex justify-between items-center px-8 py-4 bg-slate-800 border-b border-slate-700">

        <h2 className="text-xl font-bold">
          ReachInbox Dashboard
        </h2>

        <div className="flex items-center gap-4">
          <img
            src={user.picture}
            className="w-8 h-8 rounded-full"
          />
          <span className="text-gray-300">
            {user.name}
          </span>
          <button
            onClick={logout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

      </div>

      {/* Main Layout */}
      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Compose Card */}
        <div className="bg-slate-800 p-6 rounded-xl shadow">

          <h3 className="font-semibold mb-4">
            Compose New Email
          </h3>

          <input
            className="w-full p-2 mb-3 rounded bg-slate-700 outline-none"
            placeholder="Recipient Email"
            value={to}
            onChange={e => setTo(e.target.value)}
          />

          <input
            className="w-full p-2 mb-3 rounded bg-slate-700 outline-none"
            placeholder="Subject"
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />

          <textarea
            className="w-full p-2 mb-3 rounded bg-slate-700 outline-none"
            placeholder="Message Body"
            rows={4}
            value={body}
            onChange={e => setBody(e.target.value)}
          />

          <input
            type="datetime-local"
            className="w-full p-2 mb-3 rounded bg-slate-700 outline-none"
            value={time}
            onChange={e => setTime(e.target.value)}
          />

          <button
            onClick={scheduleEmail}
            className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700 transition"
          >
            Schedule Email
          </button>

        </div>

        {/* Email List */}
        <div className="bg-slate-800 p-6 rounded-xl shadow lg:col-span-2">

          {/* Tabs */}
          <div className="flex gap-6 mb-4">

            <button
              onClick={() => setActiveTab("scheduled")}
              className={`pb-2 border-b-2 ${
                activeTab === "scheduled"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400"
              }`}
            >
              Scheduled Emails
            </button>

            <button
              onClick={() => setActiveTab("sent")}
              className={`pb-2 border-b-2 ${
                activeTab === "sent"
                  ? "border-green-500 text-green-400"
                  : "border-transparent text-gray-400"
              }`}
            >
              Sent Emails
            </button>

          </div>

          {loading && (
            <p className="text-gray-400">
              Loading emails...
            </p>
          )}

          {/* Scheduled Emails */}
          {activeTab === "scheduled" && !loading && (
            <>
              {scheduled.length === 0 && (
                <p className="text-gray-400">
                  No scheduled emails
                </p>
              )}

              {scheduled.map((e) => (
                <div
                  key={e.id}
                  onClick={() => setSelectedEmail(e)}
                  className="flex justify-between items-center border-b border-slate-700 py-3 cursor-pointer hover:bg-slate-700/40 transition"
                >
                  <div>
                    <p className="font-medium">{e.to}</p>
                    <p className="text-sm text-gray-400">{e.subject}</p>
                  </div>

                  <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs">
                    Scheduled
                  </span>
                </div>
              ))}
            </>
          )}

          {/* Sent Emails */}
          {activeTab === "sent" && !loading && (
            <>
              {sent.length === 0 && (
                <p className="text-gray-400">
                  No sent emails
                </p>
              )}

              {sent.map((e) => (
                <div
                  key={e.id}
                  onClick={() => setSelectedEmail(e)}
                  className="flex justify-between items-center border-b border-slate-700 py-3 cursor-pointer hover:bg-slate-700/40 transition"
                >
                  <div>
                    <p className="font-medium">{e.to}</p>
                    <p className="text-sm text-gray-400">{e.subject}</p>
                  </div>

                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs">
                    Sent
                  </span>
                </div>
              ))}
            </>
          )}

        </div>

      </div>

      {/* Email Preview Modal */}
      {selectedEmail && (

        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <div className="bg-slate-800 w-[90%] max-w-xl rounded-xl shadow-xl p-6">

            <div className="flex justify-between items-center mb-4">

              <h3 className="text-lg font-semibold">
                Email Preview
              </h3>

              <button
                onClick={() => setSelectedEmail(null)}
                className="text-gray-400 hover:text-white"
              >
                ✖
              </button>

            </div>

            {/* SENT EMAIL VIEW */}
            {/* SENT EMAIL VIEW */}
            {/* EMAIL CONTENT */}

            {selectedEmail.status?.toLowerCase() === "sent" ? (

              <div className="text-center space-y-4">

                <p className="text-gray-300">
                  This email has been successfully delivered.
                </p>

                {selectedEmail.previewUrl ? (

                  <button
                    onClick={() => window.open(selectedEmail.previewUrl, "_blank")}
                    style={{
                      backgroundColor: "#16a34a",
                      color: "white",
                      padding: "12px",
                      borderRadius: "8px",
                      width: "100%",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Open Email Preview
                  </button>

                ) : (

                  <p className="text-red-400">
                    Preview link not available
                  </p>

                )}

              </div>

            ) : (

              <div className="space-y-3">

                <p><b>To:</b> {selectedEmail.to}</p>

                <p><b>Subject:</b> {selectedEmail.subject}</p>

                <div className="bg-slate-700 p-3 rounded">
                  {selectedEmail.body}
                </div>

                <p className="text-sm text-gray-400">
                  Scheduled At: {formatDateTime(selectedEmail.scheduledTime)}
                </p>

              </div>

            )}


          </div>

        </div>

      )}

    </div>
  );
}

export default App;
