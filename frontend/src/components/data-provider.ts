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

    async getClusters(serverName?: string): Promise<ClustersList[]> {
        return new Promise((resolve, reject) => {
            const clustersListUpdateFunc = (clusters: ClustersList[]) => resolve(clusters);
            const tornjakMessageFunc = (message: string) => {
                console.log("Message from TornjakApi:", message);
                if (message !== "OK" && message !== "No Content") {
                    reject(new Error(message));
                }
            };

            if (IsManager && serverName) {
                this.api.populateClustersUpdate(serverName, clustersListUpdateFunc, tornjakMessageFunc);
            } else {
                this.api.populateLocalClustersUpdate(clustersListUpdateFunc, tornjakMessageFunc);
            }
        });
    }

    async getEntries(serverName?: string): Promise<EntriesList[]> {
        return new Promise((resolve, reject) => {
            const entriesListUpdateFunc = (entries: EntriesList[]) => resolve(entries);
            const tornjakMessageFunc = (message: string) => {
                console.log("Message from TornjakApi:", message);
                if (message !== "OK" && message !== "No Content") {
                    reject(new Error(message));
                }
            };

            if (IsManager && serverName) {
                this.api.populateEntriesUpdate(serverName, entriesListUpdateFunc, tornjakMessageFunc);
            } else {
                this.api.populateLocalEntriesUpdate(entriesListUpdateFunc, tornjakMessageFunc);
            }
        });
    }
}