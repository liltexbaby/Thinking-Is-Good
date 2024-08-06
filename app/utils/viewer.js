"use client";

import React, { useEffect, useState, useCallback, useRef } from "react"; // Import useRef
import Image from "next/image";
import { projectData } from "../public/data/_projects";
import dynamic from "next/dynamic";
import fetchData from "./utils/fetchData";
import Viewer from "./utils/viewer";
import Marquee from "react-fast-marquee";


function page() {
  const [channels, setChannels] = useState([]); // Start with an empty array
  const [currentChannel, setCurrentChannel] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);
  const [showStatic, setShowStatic] = useState(true);
  const [tvOn, setTvOn] = useState(true); // State to manage TV power status
  const videoRef = useRef(null);
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [showCompact, setShowCompact] = useState(false);

  const toggleGuide = () => {
    setShowCompact(!showCompact);
    console.log("showCompact");
  };

  const toggleModal = () => {
    setShowModal(!showModal); // Toggle modal visibility
  };

  const toggleTvPower = () => {
    playStaticSound();
    setShowStatic(true);
    setTvOn(!tvOn); // Toggle TV on/off
  };

  const playStaticSound = () => {
    // Array of available sound files
    const sounds = ["static1.mp3", "static2.mp3", "static3.mp3"];

    // Generate a random index based on the number of sounds
    const randomIndex = Math.floor(Math.random() * sounds.length);

    // Construct the file path using the selected random sound
    const soundFilePath = `audio/${sounds[randomIndex]}`;

    // Play the sound
    const audio = new Audio(soundFilePath);
    audio.play();
  };

  const onVideoReady = () => {
    setShowStatic(false); // Hide static effect once video is ready
  };

  const playNextVideo = () => {
    setShowStatic(true); // Show static
    playStaticSound();

    if (currentChannel && currentProject) {
      const currentIndex = currentChannel.linkedProjects.findIndex(
        (project) => project.id === currentProject.id
      );
      const nextIndex =
        (currentIndex + 1) % currentChannel.linkedProjects.length; // Loop back to the first video

      const nextProject = currentChannel.linkedProjects[nextIndex];
      setCurrentProject(nextProject);

      // Update the currentChannel with the new currentChannelProject
      const updatedChannel = {
        ...currentChannel,
        currentChannelProject: nextProject,
      };

      // Update the state to reflect this change
      setCurrentChannel(updatedChannel);

      // Also update the channels array in state if needed
      const updatedChannels = channels.map((channel) =>
        channel.id === currentChannel.id ? updatedChannel : channel
      );
      setChannels(updatedChannels);
    }
  };

  // Function to play the previous video
  const playPrevVideo = () => {
    setShowStatic(true); // Show static
    playStaticSound();

    if (currentChannel && currentProject) {
      const currentIndex = currentChannel.linkedProjects.findIndex(
        (project) => project.id === currentProject.id
      );
      const prevIndex =
        currentIndex === 0
          ? currentChannel.linkedProjects.length - 1
          : currentIndex - 1;
      setCurrentProject(currentChannel.linkedProjects[prevIndex]);
      if (videoRef.current) {
        videoRef.current.play();
      }
    }
  };

  const nextChannel = () => {
    setShowStatic(true); // Show static
    playStaticSound();

    if (channels.length > 0) {
      const currentIndex = channels.findIndex(
        (channel) => channel.id === currentChannel.id
      );
      const nextIndex = (currentIndex + 1) % channels.length; // Wrap to the first channel if at the end
      setCurrentChannel(channels[nextIndex]);
      setCurrentProject(channels[nextIndex].currentChannelProject); // Assuming you want to reset to the first project in the channel
    }
  };

  const prevChannel = () => {
    setShowStatic(true); // Show static
    playStaticSound();

    if (channels.length > 0) {
      const currentIndex = channels.findIndex(
        (channel) => channel.id === currentChannel.id
      );
      const prevIndex =
        currentIndex === 0 ? channels.length - 1 : currentIndex - 1; // Wrap to the last channel if at the start
      setCurrentChannel(channels[prevIndex]);
      setCurrentProject(channels[prevIndex].currentChannelProject); // Assuming you want to reset to the first project in the channel
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  useEffect(() => {
    const fetchDataAndSetState = async () => {
      const fetchedData = await fetchData();
      if (fetchedData.length > 0) {
        const channelsWithProjects = fetchedData.map(channel => ({
          ...channel,
          currentChannelProject: channel.linkedProjects[0],  // Assumes that the first project is the current one
          nextProject: channel.linkedProjects[1] || null    // Safely get the next project or set it to null if not available
        }));
        setChannels(channelsWithProjects);
        setCurrentChannel(channelsWithProjects[0]);
        setCurrentProject(channelsWithProjects[0].currentChannelProject);
      }
    };
  
    fetchDataAndSetState();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "Space") {
        event.preventDefault();
        togglePlayPause();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [togglePlayPause]); // Ensure togglePlayPause is included if it's defined outside the effect

  useEffect(() => {
    console.log(showCompact);
  });

  const chooseChannel = (channelId) => {
    setShowStatic(true); // Show static
    playStaticSound();
  
    const selectedChannel = channels.find(channel => channel.id === channelId);
    setCurrentChannel(selectedChannel);
    setCurrentProject(selectedChannel.currentChannelProject);
    // Assuming there's no specific 'setNextProject', as the next project can be derived from the selected channel
  };

  const chooseProject = (projectId) => {
    setShowStatic(true); // Show static
    playStaticSound();

    // Find the selected project in the current channel's linked projects
    const selectedProject = currentChannel.linkedProjects.find(
      (project) => project.id === projectId
    );

    // Update the current project
    setCurrentProject(selectedProject);

    // Update the channels array with the new current project for the selected channel
    const updatedChannels = channels.map((channel) => {
      if (channel.id === currentChannel.id) {
        return { ...channel, currentChannelProject: selectedProject };
      }
      return channel;
    });

    console.log(currentProject);

    // Update the channels state
    setChannels(updatedChannels);
  };

  if (channels.length === 0) {
    return <div>Loading...</div>; // Display loading message until channels are fetched
  }


  return (

    =
    <div className="tv -top-10 flex justify-center font-eurostile">

{/* <Viewer
  channels={channels}
  currentChannel={currentChannel}
  currentProject={currentProject}
  chooseChannel={chooseChannel}
  chooseProject={chooseProject}
/>*/}



 <div className="transition-all duration-500 ease-in-out tv-guide-combo absolute top-1/4 md:top-1/2">

  {
    /*
        <img
        className="transition-all duration-500 ease-in-out tv-image z-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[500px] w-[500px] md:w-[700px] lg:w-[1070px]"
        src="img/tvbg.png"
      />
*/
  }


        {tvOn ? (
          <div
            className={`transition-all duration-500 ease-in-out tv-container -z-50 flex flex-col text-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[270px] md:w-[500px] lg:w-[770px] lg:h-[580px] md:h-[380px] mt-[25px] md:mt-[10px] lg:mt-0 overflow-hidden`}
          >
            <div
              className={`transition-all duration-500 ease-in-out border-1 border-black w-auto bg-white h-[100%] player-wrapper ${
                !showCompact ? "video" : "square"
              } relative overflow-hidden`}
            >
              {currentProject && currentProject.videoUrl && (
                <video
                  key={currentProject.videoUrl}
                  autoPlay={true}
                  onEnded={playNextVideo}
                  webkit-playsInline={true}
                  playsInline={true}
                  onLoadedData={onVideoReady}
                  className="absolute top-0 left-0 w-full h-full"
                  style={{ objectFit: "cover" }}
                >
                  <source src={currentProject.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
              {showStatic && (
                <div className="absolute top-0 left-0 w-full h-full">
                  <img
                    src="img/static.gif"
                    alt="TV Static"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <div
              className={`guide flex w-[770px] bg-white text-black transition-all duration-500 ease-in-out ${
                showCompact ? "h-0" : "h-2/5"
              }`}
            >
              <div className="lg:w-2/5 w-full overflow-y-auto">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    onClick={() => chooseChannel(channel.id)}
                    className="flex flex-row border-1 border-black h-20 w-auto z-0 hover:bg-goo"
                    style={{
                      backgroundColor:
                        channel.id == currentChannel.id ? "#c3fd8f" : "",
                    }}
                  >
                    <div className="border-2 -m-1 border-black flex flex-col w-24 items-center justify-center font-semibold bg-slime">
                      <div className="border-b-2 border-green-500 min-w-24 flex justify-center z-0">
                        <div>{channel.channel}</div>
                      </div>
                      <div>{channel.code}</div>
                    </div>
                    <div className="flex items-center font-bold p-5 truncate w-250 z-0 overflow-hidden">
                      {channel.currentChannelProject.title}
                    </div>


              
                  </div>
                ))}
              </div>

              <div className="transition-all duration-500 ease-in-out lg:w-3/5 invisible lg:visible w-0 h-auto border-0 border-black bg-butter p-4 overflow-hidden">
                <div className="font-bold">{currentProject.title}</div>
                <div>
                  {currentProject.credit}, {currentProject.date}
                </div>

                <div className="border-2 border-black w-auto h-32 bg-butter overflow-y-auto">
                  {currentChannel.linkedProjects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => chooseProject(project.id)}
                      className="flex flex-row border-0 border-black h-6 w-auto hover:bg-goo"
                      style={{
                        backgroundColor:
                          project.id == currentProject.id ? "#c3fd8f" : "",
                      }}
                    >
                      <div className="flex items-center font-bold truncate">
                        {project.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div
              currentChannel={currentChannel}
              currentProject={currentProject}
              className={``}
            >
              <div
                onClick={toggleGuide}
                className={`transition-all duration-500 ease-in-out absolute bottom-0 left-0 right-0 bg-black text-white p-4 flex justify-between items-center ${
                  !showCompact ? "translate-y-full" : "translate-y-0"
                }`}
              >
                <div className="flex flex-row items-center">
                  <span className="flex font-bold w-12 md:w-24 items-center justify-center">{currentChannel?.channel}</span>
                  <span className="truncate mr-5 md:mr-10">{currentProject?.title}</span>
                </div>
            
                <div className="truncate max-w-100">
                <Marquee
                speed={25}
                delay={0}
                >
                {currentProject?.credit},&nbsp;{currentProject?.date}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Marquee>
                </div>
              </div>
            </div>

            {showModal && (
              <div className="fixed inset-0 bg-black bg-opacity-0 z-40 flex justify-center items-center">
                <div className="border-black border-1 w-[500px] h-[300px] flex flex-col justify-center items-center">
                  <img
                    src="img/info.png"
                    alt="TV Static"
                    className="w-3/5 object-cover absolute z-0"
                  />
                  <h2 className="font-bold text-lg z-30">about</h2>
                  <p className="z-30">porous information here</p>
                  <button
                    onClick={toggleModal}
                    className="mt-4 p-2 text-white rounded"
                  ></button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="transition-all duration-500 ease-in-out tv-off-image -z-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[270px] md:w-[500px] lg:w-[770px] md:h-[380px] lg:h-[580px] mt-[25px] md:mt-[10px]  lg:mt-0">
            <img
              src="img/off.png"
              alt="TV Off"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>



      <div
        className="fixed -bottom-0 md:right-5 w-48 h-2/5 bg-cover bg-center z-50 visible md:invisible"
        style={{ backgroundImage: `url('img/remote_flat.png')` }}
      >
        {/* Define clickable areas as buttons or divs */}
        <button
          className="absolute inset-x-0 bottom-0 mb-4 w-12 h-8 bg-transparent"
          style={{ left: "43%", top: "13%" }}
          onClick={toggleTvPower}
        ></button>
        <button
          className="absolute inset-x-0 bottom-0 mb-4 w-12 h-8 bg-transparent"
          style={{ left: "18%", top: "50%" }}
          onClick={playPrevVideo}
        ></button>
        <button
          className="absolute inset-x-0 bottom-0 mb-4 w-12 h-8 bg-transparent"
          style={{ left: "70%", top: "50%" }}
          onClick={playNextVideo}
        ></button>
        <button
          className="absolute inset-x-0 bottom-0 mb-4 w-12 h-8 bg-transparent"
          style={{ left: "43%", top: "33%" }}
          onClick={prevChannel}
        ></button>
        <button
          className="absolute inset-x-0 bottom-0 mb-4 w-12 h-8 bg-transparent"
          style={{ left: "43%", top: "65%" }}
          onClick={nextChannel}
        ></button>
        <button
          className="absolute inset-x-0 bottom-0 mb-4 w-12 h-10 bg-transparent"
          style={{ left: "28%", top: "87%" }}
          onClick={toggleModal}
        ></button>
        <button
          className="absolute inset-x-0 bottom-0 mb-4 w-12 h-10 bg-transparent"
          style={{ left: "56%", top: "87%" }}
          onClick={toggleGuide}
        ></button>
      </div>





      <div
        className="fixed -bottom-12 right-50 md:right-5 w-64 h-3/5 bg-cover bg-center z-50 invisible md:visible"
        style={{ backgroundImage: `url('img/remote.png')` }}
      >
        {/* Define clickable areas as buttons or divs */}
        <button
          className="absolute inset-x-0 bottom-0 mb-4 w-12 h-8 bg-transparent"
          style={{ left: "24%", top: "13%" }}
          onClick={toggleTvPower}
        ></button>
        <button
          className="absolute inset-x-0 bottom-0 mb-4 w-12 h-8 bg-transparent"
          style={{ left: "12%", top: "30%" }}
          onClick={playPrevVideo}
        ></button>
        <button
          className="absolute inset-x-0 bottom-0 mb-4 w-12 h-8 bg-transparent"
          style={{ left: "53%", top: "30%" }}
          onClick={playNextVideo}
        ></button>
        <button
          className="absolute inset-x-0 bottom-0 mb-4 w-12 h-8 bg-transparent"
          style={{ left: "30%", top: "22%" }}
          onClick={prevChannel}
        ></button>
        <button
          className="absolute inset-x-0 bottom-0 mb-4 w-12 h-8 bg-transparent"
          style={{ left: "34%", top: "38%" }}
          onClick={nextChannel}
        ></button>
        <button
          className="absolute inset-x-0 bottom-0 mb-4 w-12 h-8 bg-transparent"
          style={{ left: "30%", top: "48%" }}
          onClick={toggleModal}
        ></button>
        <button
          className="absolute inset-x-0 bottom-0 mb-4 w-12 h-8 bg-transparent"
          style={{ left: "53%", top: "48%" }}
          onClick={toggleGuide}
        ></button>
        <button
          className="absolute inset-x-0 bottom-0 mb-4 w-12 h-8 bg-transparent"
          style={{ left: "33%", top: "56%" }}
          onClick={() => chooseChannel(channels[0].id)}
        ></button>
        <button
          className="absolute inset-x-0 bottom-0 mb-4 w-12 h-8 bg-transparent"
          style={{ left: "55%", top: "56%" }}
          onClick={() => chooseChannel(channels[1].id)}
        ></button>
        <button
          className="absolute inset-x-0 bottom-0 mb-4 w-12 h-8 bg-transparent"
          style={{ left: "36%", top: "64%" }}
          onClick={() => chooseChannel(channels[2].id)}
        ></button>
        <button
          className="absolute inset-x-0 bottom-0 mb-4 w-12 h-8 bg-transparent"
          style={{ left: "57%", top: "64%" }}
          onClick={() => chooseChannel(channels[3].id)}
        ></button>
        <button
          className="absolute inset-x-0 bottom-0 mb-4 w-12 h-8 bg-transparent"
          style={{ left: "40%", top: "71%" }}
          onClick={() => chooseChannel(channels[4].id)}
        ></button>
        <button
          className="absolute inset-x-0 bottom-0 mb-4 w-12 h-8 bg-transparent"
          style={{ left: "62%", top: "71%" }}
          onClick={() => chooseChannel(channels[5].id)}
        ></button>
        <button
          className="absolute inset-x-0 bottom-0 mb-4 w-12 h-8 bg-transparent"
          style={{ left: "62%", top: "74%" }}
          onClick={() => chooseChannel(channels[6].id)}
        ></button>
      </div>
    </div>
  );
}

export default page;
