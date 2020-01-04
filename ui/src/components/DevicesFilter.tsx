// @ts-nocheck

import React, { useRef, useMemo, useState } from 'react';
import {
  Icon,
  // @ts-ignore
} from 'evergreen-ui';

import utils from '../utils';
import theme from '../theme';
import { Column, Row, Group, Button, Input, Text, Select } from './core';
import Card from './card';
import Popup from './popup';

export type Query = Filter[];

export type Filter = Condition[];

export type Condition = {
  type: ConditionType;
  params: ConditionParams;
  options: {};
};

type ConditionType = string;
export const DevicePropertyCondition: ConditionType = 'DevicePropertyCondition';
export const LabelValueCondition: ConditionType = 'LabelValueCondition';
export const LabelExistenceCondition: ConditionType = 'LabelExistenceCondition';

export type ConditionParams =
  | DevicePropertyConditionParams
  | LabelValueConditionParams
  | LabelExistenceConditionParams;

export type DevicePropertyConditionParams = {
  property: string;
  operator: Operator;
  value: string;
};

export type LabelValueConditionParams = {
  key: string;
  operator: Operator;
  value: string;
};

export type LabelExistenceConditionParams = {
  key: string;
  operator: Operator;
};

type Operator = string;
export const OperatorIs: Operator = 'is';
export const OperatorIsNot: Operator = 'is not';
export const OperatorExists: Operator = 'exists';
export const OperatorNotExists: Operator = 'does not exist';

const DefaultDevicePropertyConditionParams = (): DevicePropertyConditionParams => {
  return {
    property: 'status',
    operator: OperatorIs,
    value: 'online',
  };
};

const DefaultLabelValueConditionParams = (): LabelValueConditionParams => {
  return {
    key: '',
    operator: OperatorIs,
    value: '',
  };
};

const DefaultLabelExistenceConditionParams = (): LabelExistenceConditionParams => {
  return {
    key: '',
    operator: OperatorExists,
  };
};

interface Props {
  whitelistedConditions?: ConditionType[];
  show: boolean;
  onClose: () => void;
  onSubmit?: (filter: Filter) => void;
  filter: Filter;
}

interface State {
  filter: Filter;
}

export const DevicesFilter = props => {
  const filterListEndRef = useRef();

  const conditionOptions = useMemo(
    () =>
      [
        {
          value: DevicePropertyCondition,
          label: 'Device Property',
        },
        {
          value: LabelValueCondition,
          label: 'Label Value',
        },
        {
          value: LabelExistenceCondition,
          label: 'Label Existence',
        },
      ].filter(c => {
        if (!props.whitelistedConditions) {
          return true;
        }
        return props.whitelistedConditions.includes(c.value);
      }),
    [props.whitelistedConditions]
  );

  const defaultCondition = useMemo(
    () =>
      [
        {
          type: DevicePropertyCondition,
          params: DefaultDevicePropertyConditionParams(),
          options: {
            type: conditionOptions[0],
            property: { value: 'status', label: 'Status' },
            operator: { value: OperatorIs, label: OperatorIs },
            value: { value: 'online', label: 'Online' },
          },
        },
        {
          type: LabelValueCondition,
          params: DefaultLabelValueConditionParams(),
          options: {},
        },
        {
          type: LabelExistenceCondition,
          params: DefaultLabelExistenceConditionParams(),
          options: {},
        },
      ].filter(c => {
        if (!props.whitelistedConditions) {
          return true;
        }
        return props.whitelistedConditions.includes(c.type);
      })[0],
    [props.whitelistedConditions]
  );

  if (!defaultCondition) {
    throw 'No default condition was whitelisted';
  }

  const [filter, setFilter] = useState(
    props.filter || [utils.deepClone(defaultCondition)]
  );

  const resetFilter = () => setFilter([utils.deepClone(defaultCondition)]);

  const renderCondition = (condition: Condition, index: number) => {
    if (condition.type === LabelValueCondition) {
      let cond = condition.params as LabelValueConditionParams;
      const selectClassName: string = utils.randomClassName();
      return (
        <>
          <Row>
            <Input
              placeholder="Key"
              padding={2}
              value={cond.key}
              onChange={(event: any) => {
                const { value: key } = event.target;
                setFilter(
                  filter.map((condition: any, i) => {
                    if (i === index) {
                      condition.params.key = key;
                    }
                    return condition;
                  })
                );
              }}
            />
          </Row>

          <Row marginX={2} flex="0 0 125px">
            <Select
              placeholder="Operator"
              className={selectClassName}
              options={[
                { label: OperatorIs, value: OperatorIs },
                { label: OperatorIsNot, value: OperatorIsNot },
              ]}
              value={condition.options.operator}
              onChange={option => {
                setFilter(
                  filter.map((condition, i) => {
                    if (i === index) {
                      condition.options.operator = option;
                      condition.params.operator = option.value;
                    }
                    return condition;
                  })
                );
              }}
            />
          </Row>

          <Row>
            <Input
              placeholder="Value"
              padding={2}
              value={cond.value}
              onChange={(event: any) => {
                const { value: value } = event.target;
                setFilter(
                  filter.map((condition: any, i) => {
                    if (i === index) {
                      condition.params.value = value;
                    }
                    return condition;
                  })
                );
              }}
            />
          </Row>
        </>
      );
    }

    if (condition.type === LabelExistenceCondition) {
      let cond = condition.params as LabelExistenceConditionParams;
      return (
        <>
          <Row flex={1}>
            <Input
              placeholder="Key"
              padding={2}
              marginRight={2}
              value={cond.key}
              onChange={(event: any) => {
                const { value: key } = event.target;
                setFilter(
                  filter.map((condition: any, i) => {
                    if (i === index) {
                      condition.params.key = key;
                    }
                    return condition;
                  })
                );
              }}
            />
          </Row>

          <Row flex="0 0 200px">
            <Select
              value={condition.options.operator}
              placeholder="Operator"
              options={[
                { label: OperatorExists, value: OperatorExists },
                {
                  label: OperatorNotExists,
                  value: OperatorNotExists,
                },
              ]}
              onChange={option => {
                setFilter(
                  filter.map((condition, i) => {
                    if (i === index) {
                      condition.options.operator = option;
                      condition.params.operator = option.value;
                    }
                    return condition;
                  })
                );
              }}
            />
          </Row>
        </>
      );
    }

    if (condition.type === DevicePropertyCondition) {
      return (
        <>
          <Row marginRight={2} flex={1}>
            <Select
              value={condition.options.property}
              placeholder="Property"
              options={[{ label: 'Status', value: 'status' }]}
              onChange={option => {
                setFilter(
                  filter.map((condition: any, i) => {
                    if (i === index) {
                      condition.options.property = option;
                      condition.params.property = option.value;
                    }
                    return condition;
                  })
                );
              }}
            />
          </Row>

          <Row marginRight={2} flex={1}>
            <Select
              value={condition.options.operator}
              placeholder="Operator"
              options={[
                { label: OperatorIs, value: OperatorIs },
                { label: OperatorIsNot, value: OperatorIsNot },
              ]}
              onChange={option => {
                setFilter(
                  filter.map((condition, i) => {
                    if (i === index) {
                      condition.options.operator = option;
                      condition.params.operator = option.value;
                    }
                    return condition;
                  })
                );
              }}
            />
          </Row>

          <Select
            value={condition.options.value}
            placeholder="Value"
            options={[
              {
                label: 'Online',
                value: 'online',
              },
              {
                label: 'Offline',
                value: 'offline',
              },
            ]}
            onChange={option => {
              setFilter(
                filter.map((condition: any, i) => {
                  if (i === index) {
                    condition.options.value = option;
                    condition.params.value = option.value;
                  }
                  return condition;
                })
              );
            }}
          />
        </>
      );
    }
  };

  const { onClose, onSubmit } = props;
  const selectClassName: string = utils.randomClassName();

  return (
    <Popup
      show={true}
      onClose={() => {
        onClose();
        resetFilter();
      }}
    >
      <Card
        border
        size="xlarge"
        title="Filter Devices"
        actions={[
          {
            title: 'Add Condition',
            variant: 'secondary',
            onClick: () => {
              setFilter([...filter, utils.deepClone(defaultCondition)]);
              setTimeout(
                () =>
                  filterListEndRef.current.scrollIntoView({
                    behavior: 'smooth',
                  }),
                100
              );
            },
          },
        ]}
      >
        <Column flex={1} marginBottom={5} overflowY="auto" maxHeight="100%">
          {filter.map((condition, index) => (
            <Group key={index}>
              <Row justifyContent="space-between" alignItems="center">
                <Row marginRight={2} flex="0 0 200px">
                  <Select
                    value={condition.options.type}
                    placeholder="Type"
                    options={conditionOptions}
                    onChange={option => {
                      setFilter(
                        filter.map((condition, i) => {
                          if (i !== index) {
                            return condition;
                          }
                          if (condition.type === option.value) {
                            return condition;
                          }

                          let params: ConditionParams;
                          switch (option.value) {
                            case DevicePropertyCondition:
                              params = DefaultDevicePropertyConditionParams();
                              break;
                            case LabelValueCondition:
                              params = DefaultLabelValueConditionParams();
                              break;
                            case LabelExistenceCondition:
                              params = DefaultLabelExistenceConditionParams();
                              break;
                            default:
                              option.value = DevicePropertyCondition;
                              params = DefaultDevicePropertyConditionParams();
                          }
                          condition = {
                            type: option.value,
                            options: {
                              type: option,
                            },
                            params,
                          };
                          return condition;
                        })
                      );
                    }}
                    className={selectClassName}
                  />
                </Row>
                {renderCondition(condition, index)}

                {index > 0 && (
                  <Button
                    title={
                      <Icon icon="cross" size={16} color={theme.colors.red} />
                    }
                    marginLeft={2}
                    variant="icon"
                    onClick={() =>
                      setFilter(filter.filter((_, i) => i !== index))
                    }
                  />
                )}
              </Row>
              {index < filter.length - 1 && (
                <Row marginTop={Group.defaultProps.marginBottom}>
                  <Text fontWeight={4} fontSize={3}>
                    OR
                  </Text>
                </Row>
              )}
            </Group>
          ))}
          <Row ref={filterListEndRef} />
        </Column>

        <Button
          title={props.filter ? 'Edit Filter' : 'Apply Filter'}
          onClick={() => {
            const validFilter = filter.filter(({ type, params }) => {
              switch (type) {
                case LabelValueCondition:
                  return (
                    params.key !== '' && params.value !== '' && params.operator
                  );
                case LabelExistenceCondition:
                  return params.key !== '' && params.operator;
                case DevicePropertyCondition:
                default:
                  return (
                    params.property && params.operator && params.value !== ''
                  );
              }
            });

            if (validFilter.length) {
              if (onSubmit) {
                onSubmit(validFilter);
              }
            } else {
              onClose();
            }

            resetFilter();
          }}
        />
      </Card>
    </Popup>
  );
};

export default DevicesFilter;
