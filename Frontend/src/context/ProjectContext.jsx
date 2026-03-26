import { createContext,useContext,useState } from "react";

const ProjectContext=createContext();

export const ProjectProvider=({children})=>{
    const [selectedProject, setSelectedProject] = useState({_id: "all",name: "All",projectIds: []});

    return(
        <ProjectContext.Provider value={{selectedProject,setSelectedProject}}>
            {children}
        </ProjectContext.Provider>
    );
}
export const useProject = () => useContext(ProjectContext);