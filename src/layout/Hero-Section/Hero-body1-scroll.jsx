import React from 'react'
import { Box } from '@mui/material'
import ScrollVelocity from '@/hooks/scrollVelocity/scrollVelocity'
import {
  MovieFilterOutlined as MovieFilterOutlinedIcon,
  AutoFixHighOutlined as AutoFixHighOutlinedIcon,
  VideoLibraryOutlined as VideoLibraryOutlinedIcon,
  TimelineOutlined as TimelineOutlinedIcon,
  TitleOutlined as TitleOutlinedIcon,
  ThreeDRotationOutlined as ThreeDRotationOutlinedIcon,
  HomeWorkOutlined as HomeWorkOutlinedIcon,
  ColorLensOutlined as ColorLensOutlinedIcon,
} from '@mui/icons-material'

const HeroBody1Scroll = () => {
  const services = [
    {
      id: "1",
      title: 'VIDEO EDITING',
      description: 'Professional video editing services with seamless cuts, color correction, and audio synchronization for films, commercials, and content.',
      icon: MovieFilterOutlinedIcon,
    },
    {
      id: "2",
      title: 'VFX',
      description: 'We add explosions, fire, smoke, and digital elements that bring your scenes to life. Perfect for films, commercials, and music videos.',
      icon: AutoFixHighOutlinedIcon,
    },
    {
      id: "3",
      title: 'REELS',
      description: 'Create engaging short-form content for social media platforms with dynamic editing, effects, and optimized formatting.',
      icon: VideoLibraryOutlinedIcon,
    },
    {
      id: "4",
      title: 'MOTION GRAPHICS',
      description: 'Animated graphics, infographics, and visual elements that enhance your content with professional motion design.',
      icon: TimelineOutlinedIcon,
    },
    {
      id: "5",
      title: 'TITLES/LOGO ANIMATION',
      description: 'Bring your branding to life with animated logos, title sequences, and branded elements for professional presentation.',
      icon: TitleOutlinedIcon,
    },
    {
      id: "6",
      title: '3D CGI',
      description: 'Create stunning 3D computer-generated imagery, characters, environments, and objects with photorealistic quality.',
      icon: ThreeDRotationOutlinedIcon,
    },
    {
      id: "7",
      title: 'REAL ESTATE',
      description: 'Specialized video production for real estate including property tours, aerial footage, and virtual walkthroughs.',
      icon: HomeWorkOutlinedIcon,
    },
    {
      id: "8",
      title: 'DI-COLOUR GRADING',
      description: 'Professional digital intermediate color grading services to achieve cinematic looks and enhance the visual storytelling of your content.',
      icon: ColorLensOutlinedIcon,
    },
  ];

  // Join all service titles into a single string with separators
  const singleScrollText = services.map(service => service.title).join(' • ');

  return (
    <Box py={5} sx={{ backgroundColor: '#0B1113' }} id="services">
        <Box >
      <ScrollVelocity
        texts={[singleScrollText]}
        velocity={100}
        className="custom-scroll-text"
      />
      </Box>
    </Box>
  )
}

export default HeroBody1Scroll