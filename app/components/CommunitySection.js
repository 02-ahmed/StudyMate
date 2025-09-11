"use client";

import {
  Box,
  Typography,
  Button,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Image from "next/image";
import { motion } from "framer-motion";
import useTranslation from "../hooks/useTranslation";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function CommunitySection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const { t } = useTranslation();

  // Community profile images
  const communityImages = [
    "/redesign/community/black-man-professional-headshot-in-a-suit-r42uk8vk2ohep4rskl06y2nqsq8o6kphm0k53of2k0.png",
    "/redesign/community/00154-Professional_headshot_of_a_young_black_woman_with_straight_black_hair_a_corporate_lawyer_in_a_classic_navy_suit.png",
    "/redesign/community/Brandon+Andre+-+Headshot+Los+Angeles+na4-3.png",
    "/redesign/community/confident-business-woman-portrait-smiling-face_53876-137693.png",
    "/redesign/community/face-portrait-manager-happy-black-260nw-2278812777.png",
    "/redesign/community/headshot-happy-successful-delighted-young-260nw-1276318882.png",
    "/redesign/community/cheerful-handsome-young-african-american-600nw-2566358183.png",
    "/redesign/community/istockphoto-1144287292-612x612.png",
    "/redesign/community/istockphoto-1262964438-612x612.png",
    "/redesign/community/istockphoto-1352025984-612x612.png",
    "/redesign/community/LinkedIn-professional-headshot.png",
    "/redesign/community/portrait-expressive-young-man-wearing-formal-suit_273609-6942.png",
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, sm: 12 },
        bgcolor: "#1E1E1E", // Dark background
        borderRadius: { xs: "24px", sm: "32px" },
        mt: { xs: 6, sm: 12 },
        mb: { xs: 6, sm: 12 },
        position: "relative",
        overflow: "hidden",
        px: { xs: 2, sm: 4, md: 6 },
      }}
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
      >
        {/* Profile Images Grid */}
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            mb: { xs: 4, sm: 5 },
          }}
        >
          <Grid
            container
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{
              maxWidth: "1000px",
              m: 0, // Override negative margins
              width: "auto",
              px: 2, // Add consistent padding
            }}
          >
            {communityImages.map((image, index) => (
              <Grid
                item
                xs={4} // Mobile: 3 per row (4 rows)
                sm={2} // Tablet/Desktop: 6 per row (2 rows)
                key={index}
              >
                <motion.div
                  variants={fadeIn}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    sx={{
                      width: { xs: "80px", sm: "100px", md: "120px" },
                      height: { xs: "80px", sm: "100px", md: "120px" },
                      borderRadius: "50%",
                      overflow: "hidden",
                      position: "relative",
                      mx: "auto",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      border: "3px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <Image
                      src={image}
                      alt={`Community member ${index + 1}`}
                      layout="fill"
                      objectFit="cover"
                    />
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Text Content */}
        <motion.div variants={fadeIn}>
          <Typography
            variant="h4"
            align="center"
            sx={{
              color: "white",
              fontWeight: 700,
              fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2.2rem" },
              maxWidth: "800px",
              mx: "auto",
              mb: { xs: 4, sm: 5 },
              px: { xs: 2, sm: 0 },
              lineHeight: 1.4,
            }}
          >
            {t(
              "landing.community.title",
              "Begin the journey of your dream career today by joining our expansive community of students and mentors"
            )}
          </Typography>
        </motion.div>

        {/* Button */}
        <motion.div variants={fadeIn} style={{ textAlign: "center" }}>
          <Button
            variant="contained"
            size="large"
            href="/sign-up"
            sx={{
              px: { xs: 4, sm: 6 },
              py: { xs: 1.5, sm: 2 },
              borderRadius: "50px",
              background: "white",
              color: "#1E1E1E",
              boxShadow: "0 8px 20px rgba(255, 255, 255, 0.2)",
              fontSize: { xs: "1rem", sm: "1.1rem" },
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                background: "white",
                boxShadow: "0 12px 25px rgba(255, 255, 255, 0.3)",
                transform: "translateY(-2px)",
              },
            }}
          >
            {t("landing.community.button", "Join Community")}
          </Button>
        </motion.div>
      </motion.div>
    </Box>
  );
}
