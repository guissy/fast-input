import { Form } from 'antd';
import * as React from 'react';
import TextareaFast, { LinkInput } from './TextareaFast';
import * as styles from './TextareaFast.less';

export default class FastInput extends React.PureComponent<FastInputProps, any> {
  constructor(props: FastInputProps) {
    super(props);
  }

  public render() {
    const { editing, values, record, index, form, rules, nameToList, parent, nameTo, name } = this.props;
    const formItemLayout = { labelCol: { span: 0 }, wrapperCol: { span: 23 } };
    const { getFieldDecorator, validateFields } = form;
    return (
      <div>
        <div hidden={editing}>
          <Form.Item
            key={record[nameTo]}
            hasFeedback={true}
            style={{
              paddingLeft: 8,
            }}
            {...formItemLayout}
          >
            {getFieldDecorator(`${parent}[${index}].${name}`, {
              rules,
              initialValue: record[name],
            })(
              <LinkInput
                onClick={() => this.props.onEditStatus(true)}
                texts={values.map((v: any) => v.host).join(',')}
                dirty={false}
              />
            )}
            {getFieldDecorator(`${parent}[${index}]${nameTo}`, { initialValue: record[nameTo] })(
              <input hidden={true} />
            )}
            {/*奇怪是加了id就保存出错*/}
            {/*{getFieldDecorator(`${parent}[${index}].id`, { initialValue: record.id })(<input hidden={true} />)}*/}
          </Form.Item>
        </div>
        {index === 0 &&
          this.props.editing &&
          <div className={styles.fast}>
            <TextareaFast
              onlyEdit={true}
              nameToList={nameToList}
              showNameTo={false}
              parent={parent}
              nameTo={nameTo}
              name={name}
              values={values}
              canFill={true}
              lineHeight={42}
              width={this.props.width}
              form={this.props.form}
              dirty={true}
              rules={rules}
              onChange={values0 => {
                if (values0) {
                  validateFields(() => false);
                  this.props.onChange(values0);
                }
                this.props.onEditStatus(false);
              }}
            />
          </div>}
      </div>
    );
  }
}

interface FastInputProps {
  editing: boolean;
  values: any[];
  record: any;
  index: number;
  form: any;
  rules: any[];
  nameToList: string[];
  parent: string;
  nameTo: string;
  name: string;
  width: number;
  onChange: (vals: any[]) => void;
  onEditStatus: (isEditing: boolean) => void;
}
