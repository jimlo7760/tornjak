import React, { useState, useEffect } from 'react';
import DataProvider from './data-provider';
import { AgentsList } from './types';

interface AgentListProps {
  serverName?: string;
}

const AgentList: React.FC<AgentListProps> = ({ serverName }) => {
  const [agents, setAgents] = useState<AgentsList[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const agentsData = await DataProvider.getAgents(serverName);
        setAgents(agentsData);
      } catch (error) {
        console.error("Failed to fetch agents:", error);
      }
    };

    fetchData();
  }, [serverName]);

  return (
      <div className="agent-list">
        {agents.map(agent => (
            <div key={agent.id.path} className="agent-item">
              {agent.id.path}
            </div>
        ))}
      </div>
  );
};

export default AgentList;