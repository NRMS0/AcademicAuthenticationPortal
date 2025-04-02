import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, Modal, Button } from "@mui/material";
import axios from "axios";
import { useTheme } from "../contexts/ThemeContext";
import api from "../services/api";

const EventsFeed = () => {
  // hooks for storing events and selected event
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  // Access the current theme 
  const theme = useTheme();

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/news-events?type=event");
        const now = new Date();
        // Filter out past events
        const filteredEvents = response.data.filter(
          (event) => new Date(event.endDate) > now
        );
        setEvents(filteredEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    
    // Call the function to fetch events
    fetchEvents();
  }, []);

  // render the events
  return (
    <Box>
      {events.length > 0 ? (
        events.map((event) => (
          <Card
            key={event._id}
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
            onClick={() => setSelectedEvent(event)}
          >
            <CardContent>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                  fontWeight: 600
                }}
              >
                {event.title}
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
                {event.description}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: theme.palette.mode === 'dark' ? '#757575' : '#9e9e9e',
                  display: 'block',
                  mt: 1
                }}
              >
                {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography sx={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000' }}>
          No upcoming events.
        </Typography>
      )}

      {/* Modal for Full Event Details */}
      <Modal open={Boolean(selectedEvent)} onClose={() => setSelectedEvent(null)}>
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
            {selectedEvent?.title}
          </Typography>
          <Typography 
            variant="body1"
            sx={{ 
              color: theme.palette.mode === 'dark' ? '#e0e0e0' : '#333333',
              mb: 2
            }}
          >
            {selectedEvent?.description}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 2, 
              fontStyle: "italic",
              color: theme.palette.mode === 'dark' ? '#b0b0b0' : '#555555'
            }}
          >
            {selectedEvent
              ? `Time: ${new Date(selectedEvent.startDate).toLocaleString()} - ${new Date(
                  selectedEvent.endDate
                ).toLocaleString()}`
              : ""}
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
            onClick={() => setSelectedEvent(null)}
          >
            Close
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default EventsFeed;