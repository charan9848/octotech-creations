

export const fadeIn = (direction, delay) =>{
    return{
        hidden:{
             opacity: 0,
            y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
            x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
        },        show:{
            y: 0,
            x: 0,
            opacity:1,
            transition:{
                type:"tween",
                duration: 0.6,
                delay: delay,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    }
}