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


export const deleteAgent = async (agentId: { path: string; trust_domain: string }, serverSelected?: string) => {
    let endpoint = IsManager ? GetApiServerUri('/manager-api/agent/delete') + "/" + serverSelected : GetApiServerUri(apiEndpoints.spireAgentsApi);
    try {
        const response = await axios.delete(endpoint, {
            data: {
                "id": agentId
            },
            headers: {
                'Content-Type': 'application/json'
            },
            crossdomain: true
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting agent:", error);
        throw error;
    }
};

export const banAgent = async (agentId: { path: string; trust_domain: string }, serverSelected?: string) => {
    let endpoint = IsManager ? GetApiServerUri('/manager-api/agent/ban') + "/" + serverSelected : GetApiServerUri(apiEndpoints.spireAgentsBanApi);
    try {
        const response = await axios.post(endpoint, { id: agentId });
        return response.data;
    } catch (error) {
        console.error("Error banning agent:", error);
        throw error;
    }
};