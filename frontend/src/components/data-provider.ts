import TornjakApi from './tornjak-api-helpers';
import {
    AgentsList,
    ClustersList,
    EntriesList,
    AgentsWorkLoadAttestorInfo,
    TornjakServerInfo,
} from './types';
import IsManager from './is_manager';

class DataProvider {
    private api: TornjakApi;

    constructor() {
        this.api = new TornjakApi({}); // Pass an empty object as props
    }

    async getAgents(serverName?: string): Promise<AgentsList[]> {
        return new Promise((resolve, reject) => {
            const agentsListUpdateFunc = (agents: AgentsList[]) => resolve(agents);
            const tornjakMessageFunc = (message: string) => {
                console.log("Message from TornjakApi:", message);
                if (message !== "OK" && message !== "No Content") {
                    reject(new Error(message));
                }
            };

            if (IsManager && serverName) {
                this.api.populateAgentsUpdate(serverName, agentsListUpdateFunc, tornjakMessageFunc);
            } else {
                this.api.populateLocalAgentsUpdate(agentsListUpdateFunc, tornjakMessageFunc);
            }
        });
    }
}