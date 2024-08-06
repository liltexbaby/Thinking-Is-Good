"use client";

import React, { useEffect, useState, useCallback, useRef } from "react"; // Import useRef
import fetchData from "./utils/fetchData";
import TVScene from "./utils/TVScene";


function page() {
  const [channels, setChannels] = useState([]); // Start with an empty array
  const [currentChannel, setCurrentChannel] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);
  const [showStatic, setShowStatic] = useState(true);
  const [tvOn, setTvOn] = useState(false); // State to manage TV power status
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
    <div className="tv flex justify-center h-dvh font-eurostile overscroll-y-none">


      <TVScene
      className='z-0 overscroll-y-none'
              channels={channels}
              currentChannel={currentChannel}
              currentProject={currentProject}
              tvOn={tvOn}
              showStatic={showStatic}
              playNextVideo={playNextVideo}
              playPrevVideo={playPrevVideo}
              chooseChannel={chooseChannel}
              toggleTvPower={toggleTvPower}
              showCompact={showCompact}
              toggleGuide={toggleGuide}
              showModal={showModal}
              toggleModal={toggleModal}
              setShowStatic={setShowStatic}
              setCurrentProject={setCurrentProject}
              setChannels={setChannels}
              nextChannel={nextChannel}
              prevChannel={prevChannel}
              
      />

      {/* <TVContent
        channels={channels}
        currentChannel={currentChannel}
        currentProject={currentProject}
        tvOn={tvOn}
        showStatic={showStatic}
        playNextVideo={playNextVideo}
        playPrevVideo={playPrevVideo}
        chooseChannel={chooseChannel}
        toggleTvPower={toggleTvPower}
        showCompact={showCompact}
        toggleGuide={toggleGuide}
        showModal={showModal}
        toggleModal={toggleModal}
        setShowStatic={setShowStatic}
        setCurrentProject={setCurrentProject}
        setChannels={setChannels}
      /> */}




    </div>
  );
}

export default page;
