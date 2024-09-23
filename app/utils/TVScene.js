import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, useGLTF, OrbitControls, useProgress } from '@react-three/drei'
import { a, useSpring, useSprings } from '@react-spring/three';
import TVContent from './TVContent';
import * as THREE from 'three';


function TVScene({
    channels, currentChannel, currentProject, tvOn, showStatic,
    playNextVideo, playPrevVideo, chooseChannel, toggleTvPower,
    showCompact, toggleGuide, showModal, toggleModal, setShowStatic,
    setCurrentProject, setChannels, prevChannel, nextChannel, onZoomChange
}) {
    const { scene: tvScene } = useGLTF('img/tv5.glb');
    const { scene: remoteScene } = useGLTF('img/remote4.glb');

    const [buttonPositions, setButtonPositions] = useState([]);
    const [buttonRotations, setButtonRotations] = useState([]);
    const [buttonScales, setButtonScales] = useState([]);

// Store the correct positions, rotations, and scales from the original buttons

    


    useEffect(() => {
        setLoading(false); // Set loading to false after assets have loaded
    }, [tvScene, remoteScene]); // Listen to changes in loaded assets
    const [loading, setLoading] = useState(true); // Add loading state
    const buttonNames = [
        "Power_Button",
        "Prev_Channel",
        "Next_Channel",
        "Prev_Proj",
        "Next_Proj",
        "Middle_Button",
        "Menu_Button",
        "Info_Button",
        "FS_Button",
        "Mute_Button",
        // ...Array.from({ length: 10 }, (_, i) => `Button_${i + 1}`), // For number buttons
      ];

      const [buttonSprings, api] = useSprings(
        buttonNames.length, // Number of springs to create
        () => ({
          position: [0, 0, 0], // Default position
          scale: [1, 1, 1], // Default scale
          config: { tension: 10, friction: 5 }, // Animation configuration
        })
      );

      useEffect(() => {
        if (remoteScene) {
          const positions = [];
          const rotations = [];
          const scales = [];
      
          buttonNames.forEach((buttonName) => {
            const buttonMesh = remoteScene.getObjectByName(buttonName);
            if (buttonMesh) {
              positions.push(buttonMesh.position.clone()); // Clone the position to avoid reference issues
              rotations.push(buttonMesh.rotation.clone()); // Clone the rotation
              scales.push(buttonMesh.scale.clone()); // Clone the scale
      
              // Set the original button's visibility to false
              buttonMesh.visible = false;
            }
          });
      
          setButtonPositions(positions);
          setButtonRotations(rotations);
          setButtonScales(scales);
      
          // Immediately apply these to the buttonSprings
          api.start((index) => ({
            position: positions[index] ? positions[index].toArray() : [0, 0, 0],
            scale: scales[index] ? scales[index].toArray() : [1, 1, 1],
          }));
        }
      }, [remoteScene, buttonNames, api]);

    

      // Initialize buttonSprings with React Spring



const logObjectHierarchy = (object, depth = 0) => {
    const padding = ' '.repeat(depth * 2);
    console.log(
      `${padding}${object.name} (${object.type}) - Position: ${object.position.toArray()}, Rotation: ${object.rotation.toArray()}, Scale: ${object.scale.toArray()}`
    );
  
    // Recursively log all children
    object.children.forEach((child) => logObjectHierarchy(child, depth + 1));
  };
  
  // Call this function after the remoteScene is loaded
  useEffect(() => {
    if (remoteScene) {
      console.log("Initial Remote Scene Hierarchy:");
      logObjectHierarchy(remoteScene);
    }
  }, [remoteScene]);





    const tvRef = useRef();
    const remoteRef = useRef();
    const htmlRef = useRef();
    const canvasRef = useRef();  // Add a ref for the canvas element
    const videoRef = useRef(); // Define videoRef here to pass down to TVContent
    const { progress } = useProgress(); // Get the loading progress percentage
    const [scale, setScale] = useState(2);
    const [htmlScale, setHtmlScale] = useState(0.105);
    const [htmlHeight, setHtmlHeight] = useState(0.1);
    const [isZoomed, setIsZoomed] = useState(false);
    const [rotationSensitivity] = useState(0.0006); // Default rotation sensitivity
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [remoteX, setRemoteX] = useState(0.65); // State for remote's x position
    const [remoteRotation, setRemoteRotation] = useState(0.0);
    const [remoteHeight, setRemoteHeight] = useState(-0.45);
    const [isMobile, setIsMobile] = useState(false); // State to track if the device is mobile
    const [isPaused, setIsPaused] = useState(false); // Initially paused
    const [isMuted, setIsMuted] = useState(false); // Initially not muted
    
    

    const touchStartY = useRef(null);

    

    const playButtonClickSound = () => {
        const audio = new Audio('audio/click.mp3'); // Replace with your actual file path
        audio.play();
      };

      useEffect(() => {
        const updatePauseState = () => {
          if (videoRef.current) {
            setIsPaused(videoRef.current.paused);
          }
        };
      
        const updateMuteState = () => {
          if (videoRef.current) {
            setIsMuted(videoRef.current.muted);
          }
        };
      
        if (videoRef.current) {
          videoRef.current.addEventListener('play', updatePauseState);
          videoRef.current.addEventListener('pause', updatePauseState);
          videoRef.current.addEventListener('volumechange', updateMuteState);
        }
      
        return () => {
          if (videoRef.current) {
            videoRef.current.removeEventListener('play', updatePauseState);
            videoRef.current.removeEventListener('pause', updatePauseState);
            videoRef.current.removeEventListener('volumechange', updateMuteState);
          }
        };
      }, [videoRef]);

    useEffect(() => {
        onZoomChange(isZoomed);
    }, [isZoomed, onZoomChange]);


    useEffect(() => {
        // Function to handle fullscreen changes
        const handleFullscreenChange = () => {
          if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            // When exiting fullscreen, reset the height
            adjustCanvasHeight();
          }
        };
      
        // Add fullscreen change event listeners
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange); // Safari support
      
        return () => {
          // Clean up the event listeners when the component unmounts
          document.removeEventListener('fullscreenchange', handleFullscreenChange);
          document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        };
      }, []);
    
    

      const handlePlayPause = () => {
        if (videoRef.current) { // Ensure the videoRef is correct
          if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPaused(false); // Update state to not paused
          } else {
            videoRef.current.pause();
            setIsPaused(true); // Update state to paused
          }
          console.log('Toggling play/pause from TVScene');
        }
      };
      
      // Function to toggle mute
      const handleMuteToggle = () => {
        if (videoRef.current) {
          videoRef.current.muted = !videoRef.current.muted;
          setIsMuted(videoRef.current.muted); // Update state based on current mute status
          console.log(`Mute toggled: ${videoRef.current.muted ? 'Muted' : 'Unmuted'}`);
        }
      };
  
  // Function to toggle fullscreen
  const handleFullscreenToggle = () => {
    if (videoRef.current) {
      // Check if the video or document is not currently in fullscreen
      if (
        !document.fullscreenElement &&
        !document.webkitFullscreenElement && // Check for Safari
        !document.mozFullScreenElement &&
        !document.msFullscreenElement &&
        !videoRef.current.webkitDisplayingFullscreen // Safari-specific check
      ) {
        // Use webkitEnterFullscreen for both mobile and desktop Safari
        if (videoRef.current.webkitEnterFullscreen) {
          videoRef.current.webkitEnterFullscreen();
        } else if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen();
        } else if (videoRef.current.webkitRequestFullscreen) {
          videoRef.current.webkitRequestFullscreen();
        } else if (videoRef.current.mozRequestFullScreen) {
          videoRef.current.mozRequestFullScreen();
        } else if (videoRef.current.msRequestFullscreen) {
          videoRef.current.msRequestFullscreen();
        }
      } else {
        // Exit fullscreen for different browsers
        if (videoRef.current.webkitExitFullscreen) {
          videoRef.current.webkitExitFullscreen();
        } else if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
      console.log('Fullscreen toggled');
    }
  };



    

    const { cameraPosition } = useSpring({
        cameraPosition: isZoomed ? [0, 0, 6] : [0, 0, 0.5],
        config: { mass: 1, tension: 170, friction: 26 },
        onChange: () => {
            if (htmlRef.current) {
                htmlRef.current.style.pointerEvents = 'auto';
            }
        }
    });

    const handlePowerButton = () => toggleTvPower();
    const handlePrevChannel = () => prevChannel();
    const handleNextChannel = () => nextChannel();
    const handlePrevProj = () => playPrevVideo();
    const handleNextProj = () => playNextVideo();
    const handleMiddleButton = () => {
        handlePlayPause(); // Call the play/pause toggle function
      };
    const handleMuteButton = () => {
    };
    const handleFSButton = () => {
    };
    const handleMenuButton = () => toggleGuide();
    const handleInfoButton = () => toggleModal();
    const handleNumberButton = (number) => console.log(`Number button ${number} clicked`);

    

    const logHtmlElementInfo = () => {
        if (htmlRef.current) {
          const computedStyles = window.getComputedStyle(htmlRef.current);
          console.log('Computed Styles:', computedStyles);
          console.log('Element Dimensions:', {
            width: htmlRef.current.clientWidth,
            height: htmlRef.current.clientHeight,
            offsetLeft: htmlRef.current.offsetLeft,
            offsetTop: htmlRef.current.offsetTop,
            overflowY: computedStyles.overflowY,
            position: computedStyles.position,
            zIndex: computedStyles.zIndex,
          });
        }
      };

    // Declare event handlers outside of useEffect
    const handleMouseMove = (e) => {
        if (!isMobile) { // Only update if not on mobile
            setMousePosition({ x: e.clientX, y: e.clientY });
        }
    };

    const handleScroll = (e) => {
        if (htmlRef.current && htmlRef.current.contains(e.target)) {
            // Log the target to debug
            console.log('Scroll event inside HTML content:', e.target);
    
            // Explicitly allow default scrolling behavior in case of Safari
            e.preventDefault();
            e.stopPropagation();
            return;
        }
    
        setIsZoomed(e.deltaY < 0);
    };

const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
};

const handleTouchMove = (e) => {
    if (!touchStartY.current) return;

    const touchEndY = e.touches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;

    if (Math.abs(deltaY) > 50) {
        setIsZoomed(deltaY < 0);
        touchStartY.current = null; // Reset touch start position
    }
};

const adjustCanvasHeight = () => {
    if (canvasRef.current) {
      const height = window.innerHeight; // Get the current window height
      canvasRef.current.style.height = `${height}px`; // Set the canvas height to the window height
  
      if (height % 2 !== 0) {
        canvasRef.current.style.height = `${height - 1}px`; // Adjust for even height if needed
      }
    }
  };

const handleResize = () => {
    adjustCanvasHeight(); // Adjust the height initially

    const width = window.innerWidth;

    if (width < 770) {
        // Mobile settings
        setScale(1.1);
        setHtmlScale(0.22);
        setHtmlHeight(0.2);
        setRemoteX(0.0); // Fixed position for mobile
        setRemoteRotation(0.0);
        setRemoteHeight(-0.49);
        setIsMobile(true); // Correctly set isMobile to true for mobile
    } else if (width >= 770 && width < 1024) {
        // Mid-screen settings
        setScale(1.5);
        setHtmlScale(0.158);
        setHtmlHeight(0.1);
        setRemoteX(0.5); // Fixed position for mid-screen
        setRemoteRotation(0.1);
        setRemoteHeight(-0.3);
        setIsMobile(false); // Ensure isMobile is set to false
    } else {
        // Desktop settings
        setScale(2);
        setHtmlScale(0.105);
        setHtmlHeight(0.1);
        setRemoteX(0.6); // Fixed position for desktop
        setRemoteRotation(0.2);
        setRemoteHeight(-0.30);
        setIsMobile(false); // Ensure isMobile is set to false
    }
};

const LoadingScreen = () => {
    const { progress } = useProgress(); // Use the useProgress hook to get the loading progress

    return (
        <Html center>
            <div style={{ 
                width: '200px', 
                height: '30px', 
                backgroundColor: '#ddd', 
                borderRadius: '15px', 
                overflow: 'hidden', 
                position: 'relative' 
            }}>
                <div 
                    style={{ 
                        width: `${progress}%`, 
                        height: '100%', 
                        backgroundColor: '#4caf50', 
                        transition: 'width 0.3s' 
                    }} 
                />
                <div 
                    style={{ 
                        position: 'absolute', 
                        top: '0', 
                        left: '50%', 
                        transform: 'translateX(-50%)', 
                        color: '#333', 
                        fontWeight: 'bold' 
                    }}>
                    {Math.floor(progress)}%
                </div>
            </div>
        </Html>
    );
};

// useEffect remains unchanged, but calls these handlers correctly
useEffect(() => {
    logHtmlElementInfo(); // Log initial state

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleScroll);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);

    handleResize(); // Call initially to set values based on current viewport

    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('wheel', handleScroll);
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchmove', handleTouchMove);
    };
}, [isZoomed]);



    return (
        <div className='w-full z-0 h-full md:h-full lg:h-full overscroll-none' ref={canvasRef}>
        <Canvas camera={{ position: [0, 0, 10] }} onCreated={() => setLoading(false)}>
        {progress < 100 && (
          <Html center>
            <div style={{ 
                width: '200px', 
                height: '30px', 
                backgroundColor: '#ddd', 
                borderRadius: '15px', 
                overflow: 'hidden', 
                position: 'relative' 
            }}>
              <div 
                style={{ 
                    width: `${progress}%`, 
                    height: '100%', 
                    backgroundColor: '#4caf50', 
                    transition: 'width 0.3s' 
                }} 
              />
              <div 
                style={{ 
                    position: 'absolute', 
                    top: '0', 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    color: '#333', 
                    fontWeight: 'bold' 
                }}>
                {Math.floor(progress)}%
              </div>
            </div>
          </Html>
        )}
                <ambientLight intensity={3.25} />
                <pointLight position={[10, 10, 10]} />
                <a.group position={cameraPosition}>
                    <primitive object={tvScene} ref={tvRef} scale={scale} position={[0, -0.1, 0]} renderOrder={1}>
                    <Html
  position={[0, 0.1, 10]}
  ref={htmlRef}
  position-z={0.47}
  position-y={htmlHeight}
  scale={htmlScale}
  transform
  style={{
    zIndex: 200000,
    pointerEvents: 'auto',
    maxHeight: '100%',
    WebkitOverflowScrolling: 'touch', // Smooth scrolling on Safari
    touchAction: 'auto',
    willChange: 'transform',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  }}
>
                            <div style={{ width: '100%', height: '100%' }}>
                            <TVContent
  {...{
    channels, currentChannel, currentProject, tvOn, showStatic,
    playNextVideo, playPrevVideo, chooseChannel, toggleTvPower,
    showCompact, toggleGuide, showModal, toggleModal, setShowStatic,
    setCurrentProject, setChannels
  }}
  isZoomed={isZoomed} 
  handlePlayPause={handlePlayPause}
  handleFullscreenToggle={handleFullscreenToggle}
  handleMuteToggle={handleMuteToggle}
  videoRef={videoRef}
  isPaused={isPaused} // Pass paused state
  isMuted={isMuted} // Pass muted state
/>
                            </div>
                        </Html>
                    </primitive>
                </a.group>
                <Pointer
    ref={tvRef}
    htmlRef={htmlRef}
    rotationSensitivity={rotationSensitivity}
    mousePosition={mousePosition}
    setRemoteX={setRemoteX}
    isMobile={isMobile}

/>
                

                
<a.group
  position={[remoteX, remoteHeight, 9.5]} // Maintain the original position of the remote
  rotation={[Math.PI / 5, 0, remoteRotation]} // Maintain the original rotation
  scale={0.1} // Maintain the original scale for the remote
>
  {/* Render the entire remote scene */}
  <primitive object={remoteScene} ref={remoteRef} renderOrder={1} />

  {/* Wrap each button in its own animated primitive */}
  {buttonNames.map((buttonName, index) => {
  const buttonMesh = remoteScene.getObjectByName(buttonName); // Get each button mesh by name
  if (!buttonMesh) return null; // Skip if the button is not found

  // Clone the button mesh to avoid modifying the original scene
  const clonedButtonMesh = buttonMesh.clone();

  // Ensure the cloned button is visible
  clonedButtonMesh.visible = true;

  // Apply the correct position, rotation, and scale from the original button
  if (buttonPositions[index] && buttonRotations[index] && buttonScales[index]) {
    clonedButtonMesh.position.copy(buttonPositions[index]);
    clonedButtonMesh.rotation.copy(buttonRotations[index]);
    clonedButtonMesh.scale.copy(buttonScales[index]);
  }

  // Get the spring for this button by index
  const springs = buttonSprings[index];

  return (
    <a.primitive
      key={buttonName}
      object={clonedButtonMesh}
      position={springs.position} // Use animated position
      scale={springs.scale} // Use animated scale
    />
  );
})}
</a.group>

<ClickableButtons
  remoteRef={remoteRef}
  handlePowerButton={handlePowerButton}
  handlePrevChannel={handlePrevChannel}
  handleNextChannel={handleNextChannel}
  handlePrevProj={handlePrevProj}
  handleNextProj={handleNextProj}
  handleMiddleButton={handleMiddleButton}
  handleMenuButton={handleMenuButton}
  handleInfoButton={handleInfoButton}
  handleNumberButton={handleNumberButton}
  handleFullscreenToggle={handleFullscreenToggle}
  handleMuteToggle={handleMuteToggle}
  playButtonClickSound={playButtonClickSound}
  tvOn={tvOn} // Pass the tvOn state to ClickableButtons
  api={api}
  buttonSprings={buttonSprings}
  buttonNames={buttonNames}
/>
                    
            </Canvas>
        </div>
    );
}

const Pointer = React.forwardRef(
    ({ htmlRef, rotationSensitivity, mousePosition, isMobile }, ref) => {
        const { viewport } = useThree();

        useFrame(() => {
            if (ref.current) {
                const xRot = (mousePosition.y / viewport.height - 60) * Math.PI * rotationSensitivity * 0.5;
                const yRot = (mousePosition.x / viewport.width - 40) * Math.PI * rotationSensitivity;
                
                // Apply rotation only if not on mobile
                if (!isMobile) {
                    ref.current.rotation.x = xRot;
                    ref.current.rotation.y = yRot;
                }

                if (htmlRef && htmlRef.current) {
                    htmlRef.current.style.transform = `rotateX(${-xRot}rad) rotateY(${yRot}rad)`;
                }
            }
        });

        return null;
    }
);

// ClickableButtons component
const ClickableButtons = ({
  remoteRef, handlePowerButton, handlePrevChannel, handleNextChannel,
  handlePrevProj, handleNextProj, handleMiddleButton, handleMenuButton,
  handleInfoButton, handleNumberButton, handleFullscreenToggle, handleMuteToggle,
  playButtonClickSound, tvOn, buttonSprings, api, buttonNames
}) => {
  const { raycaster, mouse, camera } = useThree();
  const isTouchEvent = useRef(false);
  const debounceTimeout = useRef(null);
  const buttonAnimating = useRef(buttonNames.map(() => false)); // Track animation state for each button

  // Store buttons logic separately
  const buttons = {
    "Power_Button": handlePowerButton,
    "Prev_Channel": () => tvOn && handlePrevChannel(),
    "Next_Channel": () => tvOn && handleNextChannel(),
    "Prev_Proj": () => tvOn && handlePrevProj(),
    "Next_Proj": () => tvOn && handleNextProj(),
    "Middle_Button": () => tvOn && handleMiddleButton(),
    "Menu_Button": () => tvOn && handleMenuButton(),
    "Info_Button": () => tvOn && handleInfoButton(),
    "FS_Button": () => tvOn && handleFullscreenToggle(),
    "Mute_Button": () => tvOn && handleMuteToggle(),
    ...Array.from({ length: 10 }, (_, i) => [
      `Button_${i + 1}`,
      () => tvOn && handleNumberButton(i + 1),
    ]).reduce((acc, [key, fn]) => {
      acc[key] = fn;
      return acc;
    }, {}),
  };

  // Handle hover/pointer move logic
  const handlePointerMove = (event) => {
    const rect = event.target.getBoundingClientRect();
    const clientX = event.clientX;
    const clientY = event.clientY;
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Check for button hover using the raycaster on the individual button meshes
    const buttonMeshes = buttonNames.map((name) => remoteRef.current.getObjectByName(name)).filter(Boolean);

    const intersects = raycaster.intersectObjects(buttonMeshes, true);
    if (intersects.length > 0) {
      const hoveredObject = intersects[0].object;
      if (hoveredObject.userData.name) {
        document.body.style.cursor = 'pointer'; // Change to pointer cursor on hover
      }
    } else {
      document.body.style.cursor = 'default'; // Reset cursor when not hovering over buttons
    }
  };

  // Handle click interaction logic
  const handleInteraction = (event) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      if (isTouchEvent.current && event.type === 'click') {
        return;
      }
      isTouchEvent.current = event.type === 'touchstart';

      const rect = event.target.getBoundingClientRect();
      const clientX = event.clientX || event.touches[0].clientX;
      const clientY = event.clientY || event.touches[0].clientY;
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Handle click detection using the raycaster on the individual button meshes
      const buttonMeshes = buttonNames.map((name) => remoteRef.current.getObjectByName(name)).filter(Boolean);

      const intersects = raycaster.intersectObjects(buttonMeshes, true);
      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        if (clickedObject.userData.name) {
          const buttonName = clickedObject.userData.name;
          const buttonIndex = buttonNames.indexOf(buttonName);

          if (buttonAnimating.current[buttonIndex]) {
            // If the button is still animating, ignore this interaction
            return;
          }

          console.log(`Animating Button: ${buttonName}, Current Position:`, clickedObject.position);

          // Handle button click action
          if (buttons[buttonName]) {
            buttons[buttonName]();
            playButtonClickSound();

            if (buttonIndex !== -1) {
              const currentPosition = buttonSprings[buttonIndex].position.get();

              // Mark button as animating
              buttonAnimating.current[buttonIndex] = true;

              // Trigger the button press animation
              api.start((i) =>
                i === buttonIndex
                  ? {
                      position: [currentPosition[0], -2, currentPosition[2]], // Move down on Y-axis
                      config: { tension: 200, friction: 20 }, // Faster animation
                    }
                  : null
              );

              setTimeout(() => {
                api.start((i) =>
                  i === buttonIndex
                    ? {
                        position: [currentPosition[0], 0, currentPosition[2]], // Reset Y-axis
                        config: { tension: 200, friction: 20 }, // Faster animation
                      }
                    : null
                );

                // Mark button as no longer animating after a short delay
                setTimeout(() => {
                  buttonAnimating.current[buttonIndex] = false;
                }, 200); // Animation duration
              }, 100); // Button press animation duration
            }
          }
        }
      } else {
        document.body.style.cursor = 'default'; // Reset cursor if not over a button
      }
    }, 100);
  };

  useEffect(() => {
    const handleTouchEnd = () => {
      isTouchEvent.current = false;
      document.body.style.cursor = 'default';
    };

    const handleMouseLeave = () => {
      document.body.style.cursor = 'default';
    };

    window.addEventListener('pointermove', handlePointerMove); // Hover interaction
    window.addEventListener('click', handleInteraction); // Click interaction
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [raycaster, mouse, camera, remoteRef, buttons]);

  return null;
};

export default TVScene;