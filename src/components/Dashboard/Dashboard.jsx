import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; 
import { CircularProgress, Box } from "@mui/material";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading } = useAuth(); 

  useEffect(() => {
    if (loading) return; 

    console.log("🔍 User data:", user);

    // Redirect logic
    if (user) {
      switch (user.role) {
        case "lecturer":
          console.log("Redirecting to Lecturer Dashboard");
          navigate("/lecturer-dashboard");
          break;
        case "student":
          console.log("Redirecting to Student Dashboard");
          navigate("/student-dashboard");
          break;
        default:
          console.log("Unknown role, redirecting to login.");
          navigate("/login");
          break;
      }
    } else {
      console.log("🚫 No user, redirecting to login.");
      navigate("/login");
    }
  }, [user, loading, navigate]);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <CircularProgress />
    </Box>
  );
}