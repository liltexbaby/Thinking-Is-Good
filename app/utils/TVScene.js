import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, useGLTF, OrbitControls } from '@react-three/drei';
import { a, useSpring } from '@react-spring/three';
import TVContent from './TVContent';
import * as THREE from 'three';


function TVScene({
    channels, currentChannel, currentProject, tvOn, showStatic,
    playNextVideo, playPrevVideo, chooseChannel, toggleTvPower,
    showCompact, toggleGuide, showModal, toggleModal, setShowStatic,
    setCurrentProject, setChannels, prevChannel, nextChannel,
}) {
    const { scene: tvScene } = useGLTF('img/tv5.glb');
    const { scene: remoteScene } = useGLTF('img/remote.glb');
    const tvRef = useRef();
    const remoteRef = useRef();
    const htmlRef = useRef();
    const canvasRef = useRef();  // Add a ref for the canvas element
    const [scale, setScale] = useState(2);
    const [htmlScale, setHtmlScale] = useState(0.105);
    const [htmlHeight, setHtmlHeight] = useState(0.1);
    const [isZoomed, setIsZoomed] = useState(true);
    const [rotationSensitivity] = useState(0.0006); // Default rotation sensitivity
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [remoteX, setRemoteX] = useState(0.65); // State for remote's x position
    const [remotePositionBL, setRemotePositionBL] = useState(0.6);
    const [remotePositionUL, setRemotePositionUL] = useState(0.65);
    const [remoteRotation, setRemoteRotation] = useState(0.0);
    const [remoteHeight, setRemoteHeight] = useState(-0.45);
    const [isMobile, setIsMobile] = useState(false); // State to track if the device is mobile

    const touchStartY = useRef(null);

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
    const handleMiddleButton = () => console.log('Middle button clicked');
    const handleMenuButton = () => toggleGuide();
    const handleInfoButton = () => toggleModal();
    const handleNumberButton = (number) => console.log(`Number button ${number} clicked`);

    useEffect(() => {
        const adjustCanvasHeight = () => {
            if (canvasRef.current) {
                const height = canvasRef.current.clientHeight;
                if (height % 2 !== 0) {
                    canvasRef.current.style.height = `${height - 1}px`;
                }
            }
        };

        const handleResize = () => {
            adjustCanvasHeight(); // Adjust the height initially

            const width = window.innerWidth;
            if (width < 770) {
                
                
                setScale(1.1);
                setHtmlScale(0.22);
                setHtmlHeight(0.2);
                setRemoteX(0.0);
                setRemotePositionBL(0.0);
                setRemotePositionUL(0.0);
                setRemoteRotation(0.0);
                setRemoteHeight(-0.49);
                setIsMobile(true);
                console.log("xs");
                
            } else if (width >= 770 && width < 1024) {
                
                setScale(1.5);
                setHtmlScale(0.158);
                setHtmlHeight(0.1);
                setRemoteX(0.5);
                setRemotePositionBL(0.0);
                setRemotePositionUL(0.3);
                setRemoteRotation(0.1);
                setRemoteHeight(-0.3);
                setIsMobile(false);
                console.log("small");
            } else {
                
                setScale(2);
                setHtmlScale(0.105);
                setHtmlHeight(0.1);
                setRemoteX(0.6);

                setRemotePositionBL(0.6);
                setRemotePositionUL(0.65);
                setRemoteRotation(0.2);
                setRemoteHeight(-0.30);
                setIsMobile(false);
                console.log("med");
            }
        };

        const handleMouseMove = (e) => {
            if (!isMobile) {
            setMousePosition({ x: e.clientX, y: e.clientY });
    
            
            const newRemoteX = THREE.MathUtils.mapLinear(e.clientX / window.innerWidth, 0, 1, remotePositionBL, remotePositionUL);
           
                
            setRemoteX(newRemoteX);
            }
        };

        const handleScroll = (e) => {
            if (htmlRef.current && htmlRef.current.contains(e.target)) {
                // Prevent camera zoom if the scroll is within the HTML content
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
    }, []);

    return (
        <div className='w-full z-0 h-full md:h-full lg:h-full overscroll-none' ref={canvasRef}>
            <Canvas camera={{ position: [0, 0, 10] }}>
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
        pointerEvents: 'auto', // Ensure overflow is set to auto for scrolling
        maxHeight: '100%', // Ensure it has a max height to enable scrolling
        WebkitOverflowScrolling: 'touch', // Ensure smooth scrolling on Safari
    }}
>
                            <div>
                                <TVContent
                                    {...{
                                        channels, currentChannel, currentProject, tvOn, showStatic,
                                        playNextVideo, playPrevVideo, chooseChannel, toggleTvPower,
                                        showCompact, toggleGuide, showModal, toggleModal, setShowStatic,
                                        setCurrentProject, setChannels
                                    }}
                                    isZoomed={isZoomed} // Pass isZoomed to TVContent
                                />
                            </div>
                        </Html>
                    </primitive>
                </a.group>
                <Pointer ref={tvRef} htmlRef={htmlRef} rotationSensitivity={rotationSensitivity} mousePosition={mousePosition} setRemoteX={setRemoteX} />
                <primitive object={remoteScene} ref={remoteRef} position={[remoteX, remoteHeight, 9.5]} rotation={[Math.PI / 5, 0, remoteRotation]} scale={.1} renderOrder={1} />
                <ClickableButtons remoteRef={remoteRef}
                    handlePowerButton={handlePowerButton}
                    handlePrevChannel={handlePrevChannel}
                    handleNextChannel={handleNextChannel}
                    handlePrevProj={handlePrevProj}
                    handleNextProj={handleNextProj}
                    handleMiddleButton={handleMiddleButton}
                    handleMenuButton={handleMenuButton}
                    handleInfoButton={handleInfoButton}
                    handleNumberButton={handleNumberButton} />
            </Canvas>
        </div>
    );
}

const Pointer = React.forwardRef(({ htmlRef, rotationSensitivity, mousePosition, setRemoteX }, ref) => {
    const { viewport } = useThree();

    useFrame(() => {
        if (ref.current) {
            const xRot = (mousePosition.y / viewport.height - 60) * Math.PI * rotationSensitivity * 0.5;
            const yRot = (mousePosition.x / viewport.width - 40) * Math.PI * rotationSensitivity;
            ref.current.rotation.x = xRot;
            ref.current.rotation.y = yRot;

            if (htmlRef && htmlRef.current) {
                htmlRef.current.style.transform = `rotateX(${-xRot}rad) rotateY(${yRot}rad)`;
            }

            // Update remote position based on mouse x position

        }
    });

    return null;
});

const ClickableButtons = ({
    remoteRef, handlePowerButton, handlePrevChannel, handleNextChannel,
    handlePrevProj, handleNextProj, handleMiddleButton, handleMenuButton,
    handleInfoButton, handleNumberButton
}) => {
    const { raycaster, mouse, camera } = useThree();
    const isTouchEvent = useRef(false); // Ref to track touch events

    const buttons = {
        "Power_Button": handlePowerButton,
        "Prev_Channel": handlePrevChannel,
        "Next_Channel": handleNextChannel,
        "Prev_Proj": handlePrevProj,
        "Next_Proj": handleNextProj,
        "Middle_Button": handleMiddleButton,
        "Menu_Button": handleMenuButton,
        "Info_Button": handleInfoButton,
        ...Array.from({ length: 10 }, (_, i) => [`Button_${i + 1}`, () => handleNumberButton(i + 1)]).reduce((acc, [key, fn]) => {
            acc[key] = fn;
            return acc;
        }, {})
    };

    useEffect(() => {
        if (remoteRef.current) {
            Object.keys(buttons).forEach(buttonName => {
                const button = remoteRef.current.getObjectByName(buttonName);
                if (button) {
                    button.userData = { name: buttonName };
                }
            });
        }
    }, [remoteRef]);

    const handleInteraction = (event) => {
        if (isTouchEvent.current && event.type === 'click') {
            return; // Ignore mouse events if touch events are detected
        }
        isTouchEvent.current = event.type === 'touchstart';

        const rect = event.target.getBoundingClientRect();
        const clientX = event.clientX || event.touches[0].clientX;
        const clientY = event.clientY || event.touches[0].clientY;
        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(remoteRef.current.children, true);
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            if (clickedObject.userData.name) {
                const buttonName = clickedObject.userData.name;
                if (buttons[buttonName]) {
                    buttons[buttonName]();
                }
            }
        }
    };

    useEffect(() => {
        const handleTouchEnd = () => {
            isTouchEvent.current = false; // Reset touch event flag
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);
        window.addEventListener('touchend', handleTouchEnd);
        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [raycaster, mouse, camera, remoteRef, buttons]);

    return null;
};

export default TVScene;