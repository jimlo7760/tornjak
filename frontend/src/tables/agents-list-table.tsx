import React from "react";
import { connect } from 'react-redux';
import {
    agentsListUpdateFunc,
    getAgentsList
} from 'redux/actions';
import Table from './list-table';
import { AgentsList, AgentsWorkLoadAttestorInfo } from "components/types";
import { DenormalizedRow } from "carbon-components-react";
import { RootState } from "redux/reducers";
import { showResponseToast } from "components/error-api";
import { deleteAgent, banAgent } from 'services/dataService';
import IsManager from "components/is_manager";

// AgentListTable takes in 
// listTableData: agents data to be rendered on table
// returns agents data inside a carbon component table with specified functions

type AgentsListTableProp = {
    // dispatches a payload for list of agents with their metadata info as an array of AgentListType and has a return type of void
    agentsListUpdateFunc: (globalAgentsList: AgentsList[]) => void,
    // list of available agents as array of AgentsListType
    globalAgentsList: AgentsList[],
    // 
    globalAgentsWorkLoadAttestorInfo: AgentsWorkLoadAttestorInfo[],
    // the selected server for manager mode 
    globalServerSelected: string,
    //
    data: {
        key: string,
        props: { agent: AgentsList }
    }[] | string | JSX.Element[],
    id: string,
    getAgentsList: (serverSelected?: string) => void,
}

type AgentsListTableState = {
    listData: { key: string, props: { agent: AgentsList } }[] | AgentsList[] | string | JSX.Element[],
    listTableData: { id: string, [x: string]: string; }[]
}
class AgentsListTable extends React.Component<AgentsListTableProp, AgentsListTableState> {
    constructor(props: AgentsListTableProp) {
        super(props);
        this.state = {
            listData: props.data,
            listTableData: [{ "id": "0" }],
        };
        this.prepareTableData = this.prepareTableData.bind(this);
        this.deleteAgent = this.deleteAgent.bind(this);
        this.banAgent = this.banAgent.bind(this);
    }

    componentDidMount() {
        this.props.getAgentsList(this.props.globalServerSelected);
        this.prepareTableData();
    }
    componentDidUpdate(prevProps: AgentsListTableProp) {
        if (prevProps.globalAgentsList !== this.props.globalAgentsList || prevProps.globalServerSelected !== this.props.globalServerSelected) {
            this.setState({
                listData: this.props.globalAgentsList
            })
            this.prepareTableData();
        }
    }


    prepareTableData() {
        const { globalAgentsList } = this.props;
        let listtabledata: { id: string, [x: string]: string; }[] = [];

        if (globalAgentsList) {
            listtabledata = globalAgentsList.map((agent, i) => {
                const spiffeid = `spiffe://${agent.id.trust_domain}${agent.id.path}`;
                const plugin = this.props.globalAgentsWorkLoadAttestorInfo?.find(item => item.spiffeid === spiffeid)?.plugin || "No Plugin Configured For Agent";
                return {
                    "id": (i + 1).toString(),
                    "trustdomain": agent.id.trust_domain,
                    "spiffeid": spiffeid,
                    "info": JSON.stringify(agent, null, ' '),
                    "plugin": plugin,
                };
            });
        }

        this.setState({
            listTableData: listtabledata
        })
    }

    async deleteAgent(selectedRows: readonly DenormalizedRow[]) {
        if (!selectedRows || selectedRows.length === 0) return;

        let promises = selectedRows.map(async row => {
            const trust_domain = row.cells[1].value;
            const prefix = "spiffe://";
            const path = row.cells[2].value.substr(trust_domain.concat(prefix).length);
            const agentId = { path: path, trust_domain: trust_domain };

            try {
                await deleteAgent(agentId, this.props.globalServerSelected);
                return agentId;
            } catch (error) {
                showResponseToast(error, { caption: "Could not delete agent." });
                return null;
            }
        });

        const results = await Promise.all(promises);
        const deletedAgentIds = results.filter(agentId => agentId !== null) as { path: string; trust_domain: string }[];

        if (deletedAgentIds.length > 0) {
            const updatedAgentsList = this.props.globalAgentsList.filter(agent =>
                !deletedAgentIds.some(deletedAgentId =>
                    agent.id.trust_domain !== deletedAgentId.trust_domain || agent.id.path !== deletedAgentId.path
                )
            );
            this.props.agentsListUpdateFunc(updatedAgentsList);
            window.alert(`Agents deleted successfully!`);
        }
    }

    banAgent(selectedRows: readonly DenormalizedRow[]) {
        var id: { path: string; trust_domain: string }[] = [], i = 0, endpoint = "", prefix = "spiffe://"

        if (IsManager) {
            endpoint = GetApiServerUri('/manager-api/agent/ban') + "/" + this.props.globalServerSelected

        } else {
            endpoint = GetApiServerUri(apiEndpoints.spireAgentsBanApi)
        }

        if (selectedRows === undefined || !selectedRows) return ""

        for (i = 0; i < selectedRows.length; i++) {
            id[i] = { path: "", trust_domain: "" }
            id[i].trust_domain = selectedRows[i].cells[1].value
            id[i].path = selectedRows[i].cells[2].value.substr(selectedRows[i].cells[1].value.concat(prefix).length)

            axios.post(endpoint, { id: { trust_domain: id[i].trust_domain, path: id[i].path } })
                .then(res => {
                    alert("Ban SUCCESS")
                    this.componentDidMount()
                })
                .catch((error) => showResponseToast(error, { caption: "Could not ban agent." }))
        }
    }
    render() {
        const { listTableData } = this.state;
        const headerData = [
            {
                header: '#No',
                key: 'id',
            },
            {
                header: 'Trust Domain',
                key: 'trustdomain',
            },
            {
                header: 'SPIFFE ID',
                key: 'spiffeid',
            },
            {
                header: 'Info',
                key: 'info',
            },
            {
                header: 'Workload Attestor Plugin',
                key: 'plugin',
            }
        ]
        return (
            <div>
                <Table
                    entityType={"Agent"}
                    listTableData={listTableData}
                    headerData={headerData}
                    deleteEntity={this.deleteAgent}
                    banEntity={this.banAgent}
                    downloadEntity={undefined}
                />
            </div>
        )
    }
}

const mapStateToProps = (state: RootState) => ({
    globalServerSelected: state.servers.globalServerSelected,
    globalAgentsList: state.agents.globalAgentsList,
    globalAgentsWorkLoadAttestorInfo: state.agents.globalAgentsWorkLoadAttestorInfo,
})

export default connect(
    mapStateToProps,
    { agentsListUpdateFunc }
)(AgentsListTable)