import React from 'react';
import {Container,Paper,Typography,Box,Divider} from '@mui/material';
import { useTheme } from "../../contexts/ThemeContext"; 

const Policy = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Privacy Policy
        </Typography>
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ color: theme.palette.text.secondary }}
        >
          Effective Date: {new Date().toLocaleDateString()}
        </Typography>

        <Box sx={{ my: 3 }}>
          <Typography paragraph>
          This Privacy Policy outlines how we collect, use, store, and protect data to meet the General Data Protection Regulation (GDPR). We are committed to safeguarding your personal information and ensuring transparency regarding its processing.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {[
          {
            title: "1. Lawfulness, Fairness, and Transparency",
            content:
              "We collect and process personal data lawfully, fairly, and transparently. Data is only gathered for specific legitimate purposes. such as email addresses for signup and passwords. ",
          },
          {
            title: "2. Data Minimization",
            content:
              "We only collect a minimum amount of personal data which necessary to operate our system effectively. Despite this no unnecessary data is collected. We will not request phone numbers, home addresses, or other irrelevant personal details.",
          },
          {
            title: "3. Accuracy",
            content:
              "We strive to ensure all personal data remains accurate and up-to-date. Users may request corrections to their personal information at any time via our email, passwords are able to be reset by the user in the settings menu.  ",
          },
          {
            title: "4. Storage Limitation",
            content:
              "Personal data is only retained only for as long as necessary to fulfill purposes which it was collected such as assignment submissions which  are stored only for the duration of the academic term.",
          },
          {
            title: "5. Integrity and Confidentiality",
            content:
              "We implement appropriate technical measures to secure your personal data from unauthorized access, disclosure, alteration, or destruction including encryption and regular security audits if you would like to ensure the security of your account 2factor is available from user settings. ",
          },
          {
            title: "6. Accountability",
            content:
              "We maintain comprehensive records of all data processed activities and have put measures in place to secure this data. ",
          },
        ].map((section, i) => (
          <Box key={i} sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              {section.title}
            </Typography>
            <Typography paragraph>{section.content}</Typography>
          </Box>
        ))}

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="h6" component="h3" gutterBottom>
            Contact Us
          </Typography>
          <Typography>
            If you have any questions regarding your personal data, want to request deletions or corrections:{" "}
            <strong>privacy@university.edu</strong>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Policy;
