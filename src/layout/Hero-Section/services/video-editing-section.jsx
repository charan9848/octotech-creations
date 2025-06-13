import { Box, Typography } from '@mui/material'
import React from 'react'

const VideoEditingSection = () => {
    return (
        <Box sx={{ backgroundColor: '#0B1113', }} p={5}>
            <Box m={5} sx={{ display: "flex", border: '1px solid red',justifyContent: "space-between", alignItems: "center" }}> 
                <Box  py={{md:5, xs:2, sm:3, lg:5}} pr={{md:4}} textAlign={{xs:'center',md:'start', sm:'start'}}>
                    <Box m={1} >
                        <Typography variant="h4" color="white">Video Editing</Typography>
                    </Box>
                    <Box m={1} >
                        <Typography variant="h6" >-From YouTube edits to viral reels — we cut to convert. Every second is crafted to hold attention and drive action. See what high-performance editing looks like</Typography>
                    </Box>
                </Box>
                <Box>

                </Box>

            </Box>
        </Box>
    )
}

export default VideoEditingSection