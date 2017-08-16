import {connect} from 'dva';
import { Button, Form, Table, message } from 'antd';
import { isEqual } from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { FormComponentProps, WrappedFormUtils } from 'antd/lib/form/Form';
import { State } from '../abstract/BaseModel';
import { IndexPageState } from './IndexPage.model';
import * as styles from './IndexPage.less';
import FastInput from '../components/FastInput';
import { FormEvent } from 'react';

const storageNames = 'core,games,data,common,main,logs,redis,mongodb,rabbitmq'.split(',');
function getHostFastProps(editing: string, name: string, record: any, index: number, rules: any[], width: number) {
  return {
    name,
    record,
    index,
    rules,
    width,
    editing: this.state[editing],
    values: this.state.storage,
    form: this.props.form,
    nameToList: storageNames,
    parent: 'storage',
    nameTo: 'server',
    onChange: (storage: any) => {
      this.setState({ storage });
    },
    onEditStatus: (editing0: boolean) => {
      if (editing0) {
        this.updateWidth.call(this);
      }
      this.setState({ [editing]: editing0 });
    },
  };
}


@connect(({ indexPage }: State) => ({ indexPage }))
@Form.create()
export default class IndexPage extends React.PureComponent<IndexPageProps, any> {
  private storageColumn: SiteColumn[];
  private hostNode: Table<any>;
  private hostWidths: number[] = [];

  constructor(props: IndexPageProps) {
    super(props);
    this.storageColumn = [
      { title: '主机', dataIndex: 'server' },
      {
        title: '域名',
        dataIndex: 'host',
        render: (val: string, record: any, i: number) => {
          const rules = [
            { pattern: /^[\.A-Za-z0-9\-]+(\:\d{2,5})?\/?$/, message: '请输入正确的域名或IP' },
            { required: true, message: '必填' },
          ];
          const width = this.hostWidths[0] || 200;
          return <FastInput {...getHostFastProps.call(this, 'editingHost', 'host', record, i, rules, width)} />;
        },
      },
      {
        title: '端口',
        dataIndex: 'port',
        render: (val: string, record: any, i: number) => {
          const rules = [{ pattern: /^\d{0,5}$/, message: '请输入正确的端口号' }, { required: true, message: '必填' }];
          const width = this.hostWidths[1] || 125;
          return <FastInput {...getHostFastProps.call(this, 'editingPort', 'port', record, i, rules, width)} />;
        },
      },
      {
        title: '用户',
        dataIndex: 'user',
        render: (val: string, record: any, i: number) => {
          const rules = [{ pattern: /^[A-Za-z0-9\-]{1,10}$/, message: '字母与数字的组合' }, { required: true, message: '必填' }];
          const width = this.hostWidths[2] || 125;
          return <FastInput {...getHostFastProps.call(this, 'editingUser', 'user', record, i, rules, width)} />;
        },
      },
      {
        title: '密码',
        dataIndex: 'password',
        render: (val: string, record: any, i: number) => {
          const rules = [
            { pattern: /^[A-Za-z0-9\-]{4,40}$/, message: '4位以上字母与数字的组合' },
            { required: true, message: '必填' },
          ];
          const width = this.hostWidths[3] || 200;
          return (
            <FastInput {...getHostFastProps.call(this, 'editingPassword', 'password', record, i, rules, width)} />
          );
        },
      },
      {
        title: '库名',
        dataIndex: 'db',
        render: (val: string, record: any, i: number) => {
          const rules = [{ pattern: /^[A-Za-z0-9]{1,10}$/, message: '请输入字母' }, { required: true, message: '必填' }];
          const width = this.hostWidths[4] || 100;
          return <FastInput {...getHostFastProps.call(this, 'editingDb', 'db', record, i, rules, width)} />;
        },
      },
    ];
    const editingStorage = (props.indexPage && props.indexPage.storage) || [];
    const storage = storageNames.map(name => editingStorage.find((item: any) => item.server === name) || { server: name });
    this.state = {
      storage,
    }
    this.onSubmit = this.onSubmit.bind(this);
  }
  public updateWidth(): void {
    const host = ReactDOM.findDOMNode(this.hostNode);
    if (host) {
      this.hostWidths = Array.from(host.querySelectorAll('tbody>tr:nth-child(1)>td')).slice(1).map((v: HTMLElement) => {
        v.style.width = v.clientWidth + 'px';
        return v.clientWidth;
      });
    }
  }

  public onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        message.info('表单提交成功！');
      } else {
        message.warn('表单验证不通过！');
      }
    });
  }

  public componentWillReceiveProps(nextProps: Readonly<IndexPageProps>, nextContext: any): void {
    if (
      nextProps.indexPage.storage &&
      !isEqual(this.props.indexPage.storage, nextProps.indexPage.storage)
    ) {
      const editingStorage = (nextProps.indexPage && nextProps.indexPage.storage) || [];
      const storage = storageNames.map(
        name => editingStorage.find((item: any) => item.server === name) || { server: name }
      );
      this.setState({ storage });
    }
  }

  public render() {
    return (
      <Form onSubmit={this.onSubmit}>
        <Table
          ref={ref => (this.hostNode = ref)}
          className={styles.siteTable}
          bordered={true}
          size="small"
          dataSource={this.state.storage as any}
          columns={this.storageColumn}
          rowKey={(v: any, i:number)=>String(i)}
          pagination={false}
        />
        <div className={styles.btns}>
          <Button type="primary" htmlType="submit">提交</Button>
        </div>
      </Form>
    );
  }
}

interface IndexPageProps extends ReduxProps, FormComponentProps {
  form: WrappedFormUtils;
  indexPage?: IndexPageState;
}

interface SiteColumn {
  title: string;
  className?: string;
  dataIndex: string;
  render?: any;
}
