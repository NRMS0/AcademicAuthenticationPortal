import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, Modal, Button } from "@mui/material";
import axios from "axios";
import { useTheme } from "../contexts/ThemeContext";
import api from "../services/api"

const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [error, setError] = useState(null);
  const theme = useTheme();

  // Fetch news from the backend
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await api.get("/news-events?type=news");

        //Check if response data is array 
        if (!Array.isArray(response.data)) {
          throw new Error("Unexpected response format: Expected an array");
        }

        // Update the state with fetched news
        setNews(response.data);
      } catch (error) {
        console.error("Error fetching news:", error);
        setError(error.message);
      }
    };

    fetchNews();
  }, []);

  //If there's an error display it
  if (error) {
    return (
      <Typography color="error" align="center">
        {error}
      </Typography>
    );
  }

  // Page layout
  return (
    <Box>
      {news.length > 0 ? (
        news.map((item) => (
          <Card
            key={item._id}
            sx={{ 
              marginBottom: 2, 
              cursor: "pointer",
              backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff',
              border: theme.palette.mode === 'dark' ? '1px solid #333' : '1px solid #e0e0e0',
              '&:hover': {
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0px 4px 20px rgba(255, 255, 255, 0.1)' 
                  : '0px 4px 20px rgba(0, 0, 0, 0.1)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
            onClick={() => setSelectedNews(item)}
          >
            <CardContent>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                  fontWeight: 600
                }}
              >
                {item.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.mode === 'dark' ? '#b0b0b0' : '#555555',
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                  mt: 1
                }}
              >
                {item.description}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: theme.palette.mode === 'dark' ? '#757575' : '#9e9e9e',
                  display: 'block',
                  mt: 1
                }}
              >
                Published on: {new Date(item.date).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography sx={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000' }}>
          No current news.
        </Typography>
      )}

      {/* Full News Details */}
      <Modal open={Boolean(selectedNews)} onClose={() => setSelectedNews(null)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff',
            p: 3,
            borderRadius: 2,
            maxWidth: "500px",
            width: '90%',
            outline: 'none',
            border: theme.palette.mode === 'dark' ? '1px solid #333' : '1px solid #e0e0e0',
            boxShadow: theme.palette.mode === 'dark' 
              ? '0px 5px 15px rgba(0, 0, 0, 0.5)' 
              : '0px 5px 15px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
              fontWeight: 600
            }}
          >
            {selectedNews?.title}
          </Typography>
          <Typography 
            variant="body1"
            sx={{ 
              color: theme.palette.mode === 'dark' ? '#e0e0e0' : '#333333',
              mb: 2
            }}
          >
            {selectedNews?.description}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.mode === 'dark' ? '#757575' : '#9e9e9e',
              display: 'block',
              mb: 2
            }}
          >
            Published on: {selectedNews ? new Date(selectedNews.date).toLocaleDateString() : ""}
          </Typography>
          <Button
            variant="contained"
            sx={{ 
              mt: 2,
              backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#1976d2',
              color: theme.palette.mode === 'dark' ? '#ffffff' : '#ffffff',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? '#616161' : '#1565c0'
              }
            }}
            onClick={() => setSelectedNews(null)}
          >
            Close
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default NewsFeed;