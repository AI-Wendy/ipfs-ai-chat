import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";

const ProtectedRoute = (props) => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const is_conn = localStorage.getItem("is_conn");

    if (is_conn) {
       //console.log("IS ALREADY CONNECTED");
      setIsLoading(false);
    }
    else navigate("/connect");
  }, [navigate]);

  return (
    isLoading ? (
      <Loading />
    ) : (
      <Box sx={{ height: "100vh" }}>
        {props.children}
      </Box>
    )
  );
};

export default ProtectedRoute;
