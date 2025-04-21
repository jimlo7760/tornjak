import GetApiServerUri from 'components/helpers';
import IsManager from 'components/is_manager';
import axios from 'axios';
import apiEndpoints from 'components/apiConfig';



const fetchData = async (endpoint: string, isManager: boolean, serverSelected?: string) => {
    let url = GetApiServerUri(endpoint);
    if (isManager && serverSelected) {
        url += `/${serverSelected}`;
    }
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};

export const fetchAgents = async (serverSelected?: string) => {
    const endpoint = IsManager ? '/manager-api/agent/list' : apiEndpoints.spireAgentsApi;
    return fetchData(endpoint, IsManager, serverSelected);
};
