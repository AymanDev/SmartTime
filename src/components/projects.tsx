import * as React from 'react';
import {Button, Card, Confirm, Form, Header, Icon, Image, Modal, Table} from 'semantic-ui-react';
import axios from 'axios';

interface ProjectsPageState {
  projects: ProjectData[],
  projectData: ProjectData,
  deleteTaskConfirm: boolean,
  changeTaskModal: boolean,
  createTaskModal: boolean,
  createProjectModal: boolean,
  newProjectData: ProjectData,
  result: string,
  currentTaskId: number,
  taskCreationData: TaskData,
  currentTask: TaskData
}

interface ProjectData {
  id?: string,
  name: string,
  customer: string,
  startDate?: string,
  endDate?: string,
  imageUrl?: string,
  description: string,
  tasks?: TaskData[]
}

export interface TaskData {
  id?: number,
  name: string,
  type: string,
  time?: number,
  project_id?: number
  user_id?: number
}

class ProjectsPage extends React.Component<any, ProjectsPageState> {

  state = {
    projects: [],
    projectData: undefined,
    deleteTaskConfirm: false,
    changeTaskModal: false,
    createTaskModal: false,
    createProjectModal: false,
    newProjectData: undefined,
    result: 'idle',
    currentTaskId: -1,
    taskCreationData: {
      name: "",
      user_id: 3,
      project_id: 1,
      type: ""
    },
    currentTask: {
      id: -1,
      name: "",
      type: "",
      time: 0
    }
  };

  constructor(props) {
    super(props);

    if (typeof this.state.projectData === 'undefined' && typeof this.props.match.params.projectId !== 'undefined') {
      window.location.assign('/projects');
    }
  }

  componentDidMount() {
    if (typeof this.props.match.params.projectId !== 'undefined') {
      this.setState({
        projectData: this.state.projects.find(project => project.id === this.props.match.params.projectId)
      });
    }
    this.updateProjects();
  }

  projectRowClickHandler(projectId: string) {
    this.props.history.push({
      pathname: '/projects/' + projectId,
    });
    this.setState({
      projectData: this.state.projects.find(project => project.id === projectId)
    });
    setTimeout(() => this.updateTasks(), 100);
  };

  createProject = (projectData: ProjectData) => {
    this.setState({result: 'awaiting'});
    axios.post('https://бизхак.мойдомен.рф/api/projects', {
      user_id: 3,
      name: projectData.name,
      description: projectData.description,
      customer: projectData.customer
    }).then((res) => {
      if (res.data.status === 'success') {
        this.setState({result: 'success', createProjectModal: false});
        this.updateProjects();
      } else {
        this.setState({result: 'failed', createProjectModal: false});
      }
    }).catch(() => {
      this.setState({result: 'failed', createProjectModal: false});
    });
  };

  createTask = () => {
    this.setState({result: 'awaiting'});
    const taskCreationData = this.state.taskCreationData;
    taskCreationData.project_id = this.state.projectData.id;
    taskCreationData.user_id = 3;
    axios.post('https://бизхак.мойдомен.рф/api/tasks', taskCreationData).then((res) => {
      if (res.data.status === 'success') {
        this.setState({result: 'success', createTaskModal: false});
        this.updateTasks();
      } else {
        this.setState({result: 'failed', createTaskModal: false});
      }
    }).catch(() => {
      this.setState({result: 'failed'});
    });
  };

  updateTask(taskData: TaskData) {
    this.setState({result: 'awaiting'});
    axios.patch('https://бизхак.мойдомен.рф/api/tasks/', {
      id: taskData.id,
      data: {
        name: taskData.name,
        type: taskData.type
      }
    }).then(res => {
      if (res.data.status === 'success') {
        this.setState({result: 'success', changeTaskModal: false});
        this.updateTasks();
      }
    }).catch(() => {
      this.setState({result: 'failed', changeTaskModal: false});
    });
  }

  updateTasks() {
    axios.get('https://бизхак.мойдомен.рф/api/tasks/?by=project_id&filter=' + this.state.projectData.id).then(res => {
      const projectData = this.state.projectData;
      projectData.tasks = res.data.tasks;
      this.setState({projectData, result: 'success'});
    }).catch(() => {
      this.setState({result: 'failed'});
    });
  }

  deleteTask(taskId) {
    axios.delete('https://бизхак.мойдомен.рф/api/tasks/', {data: {id: taskId}}).then(res => {
      if (res.data.status === 'success') {
        this.setState({result: 'success', changeTaskModal: false});
        this.updateTasks();
      } else {
        this.setState({result: 'failed', changeTaskModal: false});
      }
    }).catch(() => {
      this.setState({result: 'failed', changeTaskModal: false});
    });
  }

  updateProjects() {
    this.setState({result: 'awaiting'});
    axios.get('https://бизхак.мойдомен.рф/api/projects/?by=user_id&filter=3').then(res => {
      this.setState({projects: res.data.projects, result: 'success', createProjectModal: false});
      this.updateTasks();
    }).catch(() => {
      this.setState({result: 'failed', createProjectModal: false});
    });
  }

  getProjectRowView(projectData: ProjectData) {
    return (
      <Table.Row onClick={() => this.projectRowClickHandler(projectData.id)} style={{cursor: "pointer"}}>
        <Table.Cell>{projectData.name}</Table.Cell>
        <Table.Cell>{projectData.customer}</Table.Cell>
        <Table.Cell>{projectData.description}</Table.Cell>
      </Table.Row>
    );
  }

  render() {
    if (typeof this.props.match.params.projectId !== 'undefined') {
      return this.renderProjectView(this.state.projectData);
    }
    return this.renderProjectsView();
  }

  renderProjectsView() {
    return (
      <div>
        <Table stackable celled padded>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Имя проекта</Table.HeaderCell>
              <Table.HeaderCell>Заказчик</Table.HeaderCell>
              <Table.HeaderCell>Описание</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {(() => {
              const projectRowViews = [];
              Object.values(this.state.projects).forEach(projectData => {
                projectRowViews.push(this.getProjectRowView(projectData));
              });
              return projectRowViews;
            })()}
          </Table.Body>
        </Table>
        <Button content="Создать проект" color="green" icon="checkmark" labelPosition="left"
                fluid loading={this.state.result === 'awaiting'}
                onClick={() => this.setState({
                  newProjectData: {
                    name: "",
                    description: "",
                    customer: "",
                  }, createProjectModal: true
                })}/>
        <Modal basic open={this.state.createProjectModal}>
          <Header icon="pencil alternate" content="Создание проекта"/>
          <Modal.Content>
            <Form inverted>
              <Form.Field>
                <Form.Input label="Название:" placeholder="Название" onChange={(_e, {value}) => {
                  const project = this.state.newProjectData;
                  project.name = value;
                  this.setState({newProjectData: project});
                }}/>
              </Form.Field>
              <Form.Field>
                <Form.Input label="Описание:" placeholder="Описание" onChange={(_e, {value}) => {
                  const project = this.state.newProjectData;
                  project.description = value;
                  this.setState({newProjectData: project});
                }}/>
              </Form.Field>
              <Form.Field>
                <Form.Input label="Заказчик:" placeholder="Заказчик" onChange={(_e, {value}) => {
                  const project = this.state.newProjectData;
                  project.customer = value;
                  this.setState({newProjectData: project});
                }}/>
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button basic color='red' inverted
                    onClick={() => this.setState({newProjectData: undefined, createProjectModal: false})}
                    loading={this.state.result === 'awaiting'}>
              <Icon name='remove'/> Отмена
            </Button>
            <Button color='green' inverted
                    onClick={() => this.createProject(this.state.newProjectData)}
                    loading={this.state.result === 'awaiting'}>
              <Icon name='checkmark'/> Создать
            </Button>
          </Modal.Actions>
        </Modal>
      </div>
    );
  }

  renderProjectView(projectData: ProjectData) {
    return (
      <div>
        <Card centered>
          <Image src={projectData.imageUrl} wrapped ui={false}/>
          <Card.Content>
            <Card.Header>{projectData.name}</Card.Header>
            <Card.Description>
              {projectData.description}
            </Card.Description>
          </Card.Content>
        </Card>
        <Table celled stackable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell textAlign="center">Название</Table.HeaderCell>
              <Table.HeaderCell textAlign="center">Тэги</Table.HeaderCell>
              <Table.HeaderCell width={3} textAlign="center">Время на задаче</Table.HeaderCell>
              <Table.HeaderCell width={5} textAlign="center">Редактирование</Table.HeaderCell>
              <Table.HeaderCell width={3} textAlign="center">Удаление</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {(() => {
              if (projectData.tasks) {
                const taskRowViews = [];
                Object.values(projectData.tasks).forEach((taskData: TaskData) => {
                  taskRowViews.push(this.getTaskRowView(taskData));
                });
                return taskRowViews;
              }
            })()}
          </Table.Body>
        </Table>
        <Button content="Создать задачу" color="green" icon="checkmark" labelPosition="left"
                fluid loading={this.state.result === 'awaiting'}
                onClick={() => this.setState({createTaskModal: true})}/>
        <Modal basic open={this.state.createTaskModal}>
          <Header icon="pencil alternate" content="Создание задачи"/>
          <Modal.Content>
            <Form inverted>
              <Form.Field>
                <Form.Input label="Название:" placeholder="Название" onChange={(_e, {value}) => {
                  const projectData = this.state.taskCreationData;
                  projectData.name = value;
                  this.setState({taskCreationData: projectData})
                }}/>
              </Form.Field>
              <Form.Field>
                <Form.Input label="Тэги:" placeholder="Тэги" onChange={(_e, {value}) => {
                  const projectData = this.state.taskCreationData;
                  projectData.type = value;
                  this.setState({taskCreationData: projectData})
                }}/>
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button basic color='red' inverted
                    onClick={() => this.setState({currentTaskId: -1, createTaskModal: false})}
                    loading={this.state.result === 'awaiting'}>
              <Icon name='remove'/>Отмена
            </Button>
            <Button color='green' inverted onClick={this.createTask}
                    loading={this.state.result === 'awaiting'}>
              <Icon name='checkmark'/>Создать
            </Button>
          </Modal.Actions>
        </Modal>

        <Modal basic open={this.state.changeTaskModal}>
          <Header icon="pencil alternate" content="Редактирование задачи"/>
          <Modal.Content>
            <Form inverted>
              <Form.Field>
                <Form.Input label="Название:" placeholder="Название" value={this.state.currentTask.name}
                            onChange={(_e, {value}) => {
                              const task = this.state.currentTask;
                              task.name = value;
                              this.setState({currentTask: task});
                            }}/>
              </Form.Field>
              <Form.Field>
                <Form.Input label="Тэги:" placeholder="Тэги" value={this.state.currentTask.type}
                            onChange={(_e, {value}) => {
                              const task = this.state.currentTask;
                              task.type = value;
                              this.setState({currentTask: task});
                            }}/>
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button basic color='red' inverted
                    onClick={() => this.setState({currentTaskId: -1, changeTaskModal: false})}
                    loading={this.state.result === 'awaiting'}>
              <Icon name='remove'/> Отмена
            </Button>
            <Button color='green' inverted
                    onClick={() => this.updateTask(this.state.currentTask)}
                    loading={this.state.result === 'awaiting'}>
              <Icon name='checkmark'/> Изменить
            </Button>
          </Modal.Actions>
        </Modal>
        <Confirm open={this.state.deleteTaskConfirm} header="Вы точно хотите удалить эту задачу?"
                 content="Вы уверены?"
                 onCancel={() => this.setState({result: 'canceled', deleteTaskConfirm: false})}
                 onConfirm={() => {
                   this.setState({result: 'awaiting', deleteTaskConfirm: false});
                   this.deleteTask(this.state.currentTaskId);
                 }}/>
      </div>
    );
  }

  getTaskRowView(taskData: TaskData) {
    return (
      <Table.Row>
        <Table.Cell>{taskData.name}</Table.Cell>
        <Table.Cell>{taskData.type}</Table.Cell>
        <Table.Cell>{Math.round(taskData.time / 2)} минут</Table.Cell>
        <Table.Cell>
          <Button color="orange" labelPosition="left" icon fluid
                  loading={this.state.result === 'awaiting'}
                  onClick={() => this.setState({
                    changeTaskModal: true,
                    currentTaskId: taskData.id,
                    currentTask: taskData
                  })}>
            <Icon name="pencil alternate"/>Редактировать
          </Button>
        </Table.Cell>
        <Table.Cell>
          <Button color="red" labelPosition="left" icon fluid
                  loading={this.state.result === 'awaiting'}
                  onClick={() => this.setState({
                    deleteTaskConfirm: true,
                    currentTaskId: taskData.id,
                    currentTask: taskData
                  })}>
            <Icon name="trash alternate"/> Удалить
          </Button>
        </Table.Cell>
      </Table.Row>
    );
  }
}

export default ProjectsPage;