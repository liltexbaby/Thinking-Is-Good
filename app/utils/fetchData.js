const axios = require('axios');

// Define Airtable base ID and personal access token
const BASE_ID = 'appUjNyE5YU8phoyF';
const API_KEY = 'patEqcH2F2Ugrvjit.869e813bf0744f09856edf7fed150ff4e828eb9fd1f75f01f5ca32c83f5ba336';

// Function to fetch data from Airtable
const fetchData = async () => {
    try {
      // Fetch categories data
      const categoriesResponse = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/tblq6rd9xddWjXSeL`,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );
      const categoriesData = await categoriesResponse.json();
  
      console.log('Categories data:', categoriesData);
  
      // Fetch projects data
      const projectsResponse = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/tblGwpKdL7RJUZR5w`,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );
      const projectsData = await projectsResponse.json();
  
      console.log('Projects data:', projectsData);
  
      // Initialize array to hold categories
      const categories = [];

      // Process categories data
      categoriesData.records.forEach(categoryRecord => {
        const categoryAttributes = categoryRecord.fields;

        // Initialize category object with category attributes
        const category = {
          id: categoryRecord.id,
          guideTitle: categoryAttributes.guideTitle,
          channel: categoryAttributes.channel,
          code: categoryAttributes.code,
          linkedProjects: [] // Initialize array to hold linked projects
        };

        // Process linked projects for this category
        if (categoryAttributes.linkedProjects) {
          categoryAttributes.linkedProjects.forEach(linkedProjectId => {
            // Find project data corresponding to linked project ID
            const projectData = projectsData.records.find(
              project => project.id === linkedProjectId
            );

            // If project data is found and videoUrl is not empty, add it to the category's linked projects array
            if (projectData && projectData.fields.videoUrl) {
              category.linkedProjects.push({
                title: projectData.fields.title,
                date: projectData.fields.date,
                videoUrl: projectData.fields.videoUrl,
                webLink: projectData.fields.webLink,
                credit: projectData.fields.credit,
                readyToAir: projectData.fields.readyToAir,
                id: projectData.fields.id
              });
            }
          });
        }

        // Set the first project as the current channel project if there are any projects
        category.currentChannelProject = category.linkedProjects.length > 0 ? category.linkedProjects[0] : null;

        // Push the category object to the categories array only if there are linked projects
        if (category.linkedProjects.length > 0) {
          categories.push(category);
        }
      });

      // Log raw data received
      console.log('Categories Data:', categoriesData);
      console.log('Projects Data:', projectsData);

      // Return the array of categories
      return categories;
    } catch (error) {
      console.error('Error Fetching Data from Airtable:', error);
      throw error;
    }
}

export default fetchData;
