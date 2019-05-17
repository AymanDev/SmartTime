import * as React from 'react';
import 'semantic-ui-css/semantic.min.css';
import {Button, Header, Icon, Loader, Segment, Table} from 'semantic-ui-react';
import {TaskData} from './projects';
import axios from 'axios';

interface IndexState {
  taskData: TaskData,
  result: string
}

class Index extends React.Component<any, IndexState> {

  state = {
    result: 'idle',
    taskData: undefined
  }

  componentDidMount() {
    this.setState({
      result: 'awaiting'
    });
    axios.get('https://бизхак.мойдомен.рф/api/tasks?by=last&filter=3').then((res) => {
      const taskId = res.data.task_id;
      if (taskId === null) {
        this.setState({
          result: 'success'
        });
        return;
      }
      axios.get('https://бизхак.мойдомен.рф/api/tasks?by=id&filter=' + taskId).then((res) => {
        this.setState({
          taskData: res.data.tasks,
          result: 'success'
        });
      }).catch(() => {
        this.setState({
          result: 'failed'
        });
      });
    }).catch(() => {
      this.setState({
        result: 'failed'
      });
    });
  }

  render() {
    return (
      <div>
        <Segment textAlign="center">
          <Loader className={this.state.result === 'awaiting' ? 'active' : 'disabled'}/>
          {(() => {
            if (this.state.taskData) {
              return (
                <Table celled>
                  <Table.Header>
                    <Table.HeaderCell textAlign="center">Название</Table.HeaderCell>
                    <Table.HeaderCell textAlign="center">Тэги</Table.HeaderCell>
                    <Table.HeaderCell textAlign="center">Время на задаче:</Table.HeaderCell>
                    <Table.HeaderCell textAlign="center">Перейти к задаче</Table.HeaderCell>
                  </Table.Header>
                  <Table.Row>
                    <Table.Cell>{this.state.taskData.name}</Table.Cell>
                    <Table.Cell>{this.state.taskData.type}</Table.Cell>
                    <Table.Cell>{Math.round(this.state.taskData.time / 2)} минут</Table.Cell>
                    <Table.Cell>
                      <Button color="orange" labelPosition="left" icon fluid
                              loading={this.state.result === 'awaiting'}
                              onClick={() => this.props.history.push('/projects/' + this.state.taskData.project_id)}>
                        <Icon name="pencil alternate"/>Открыть задачу
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                </Table>
              );
            } else if (this.state.result === 'success') {
              return (<Header as="h3">Нет активной задачи!</Header>);
            }

            if (this.state.result === 'failed') {
              return (<Header as="h3">Ошибка при загрузке активной задачи!</Header>);
            }
          })()}
        </Segment>
      </div>
    );
  }
}

export default Index;