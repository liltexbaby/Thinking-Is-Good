"use client";

import React, { useEffect, useState, useCallback, useRef } from "react"; // Import useRef
import fetchData from "./fetchData";
import Marquee from "react-fast-marquee";


function TVContent({
  channels,
  currentChannel,
  currentProject,
  tvOn,
  showStatic,
  playNextVideo,
  playPrevVideo,
  chooseChannel,
  toggleTvPower,
  showCompact,
  toggleGuide,
  showModal,
  toggleModal,
  setShowStatic,
  setCurrentProject,
  setChannels,
  isZoomed,

}) {

  const videoRef = useRef(null);
  const audioRefs = useRef([]);

  useEffect(() => {
      if (videoRef.current) {
          videoRef.current.volume = isZoomed ? 1 : 0.2; // Adjust video volume
      }
      audioRefs.current.forEach(audio => {
          if (audio) {
              audio.volume = isZoomed ? 1 : 0.2; // Adjust other audio elements' volume
          }
      });
  }, [isZoomed]);




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

  

  // Function to play the previous vide

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
    <div className="tv -top-10 flex justify-center font-eurostile">

{/* <Viewer
  channels={channels}
  currentChannel={currentChannel}
  currentProject={currentProject}
  chooseChannel={chooseChannel}
  chooseProject={chooseProject}
/>*/}



 <div className="transition-all duration-500 ease-in-out z-50 tv-guide-combo absolute">

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
            className={` tv-container flex flex-col text-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[270px] md:w-[500px] lg:w-[750px] lg:h-[580px] md:h-[380px] mt-[25px] md:mt-[10px]  lg:mt-0 overflow-hidden`}
          >
            <div
              className={`transition-all duration-500 ease-in-out border-1 border-black w-auto bg-white h-[100%] player-wrapper z-100 ${
                !showCompact ? "video" : "square"
              } relative overflow-hidden`}
            >
              {currentProject && currentProject.videoUrl && (
                <video
                  controls
                  key={currentProject.videoUrl}
                  autoPlay={true}
                  onEnded={playNextVideo}
                  webkit-playsInline={true}
                  playsInline={true}
                  onLoadedData={onVideoReady}
                  className="absolute top-0 left-0 w-full h-full"
                  style={{ objectFit: "cover" }}
                >
                  <source src={'https://d1n68de97bad3q.cloudfront.net/' + currentProject.videoUrl} type="video/mp4" />
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
              className={`guide flex w-[770px] bg-white text-black transition-all duration-500 ease-in-out z-50 ${
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

                <div className="border-2 border-black w-auto mr-5 h-32 bg-butter overflow-y-auto">
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
                className={`transition-all duration-500 ease-in-out absolute bottom-0 left-0 right-0 bg-slime text-black p-4 flex justify-between items-center z-50 ${
                  !showCompact ? "translate-y-full" : "translate-y-0"
                }`}
              >
                <div className="flex flex-row items-center">
                  <span className="flex font-bold w-12 md:w-24 items-center justify-center">{currentChannel?.channel}</span>
                  <span className="truncate mr-5 md:mr-10">{currentProject?.title}</span>
                </div>
            
                <div className="truncate max-w-100">
  
                {currentProject?.credit},&nbsp;{currentProject?.date}
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
          <div className=" tv-off-image -z-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[270px] md:w-[500px] lg:w-[750px] md:h-[380px] lg:h-[580px] mt-[25px] md:mt-[10px]  lg:mt-0">
            <img
              src="img/off.png"
              alt="TV Off"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>



     


    </div>
  );
}

export default TVContent;
