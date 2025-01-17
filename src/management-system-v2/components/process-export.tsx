'use client';

import React, { useState } from 'react';

import {
  Modal,
  Checkbox,
  Radio,
  RadioChangeEvent,
  Space,
  Flex,
  Divider,
  Tooltip,
  Slider,
} from 'antd';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';

import { exportProcesses } from '@/lib/process-export';
import { ProcessExportOptions } from '@/lib/process-export/export-preparation';

const exportTypeOptions = [
  { label: 'BPMN', value: 'bpmn' },
  { label: 'PDF', value: 'pdf' },
  { label: 'SVG', value: 'svg' },
  { label: 'PNG', value: 'png' },
];

const exportSubOptions = {
  bpmn: [
    {
      label: 'with artefacts',
      value: 'artefacts',
      tooltip:
        'Also export html and images used in User-Tasks and images used for other process elements',
    },
    {
      label: 'with referenced processes',
      value: 'imports',
      tooltip: 'Also export all referenced processes used in call-activities',
    },
  ],
  pdf: [
    {
      label: 'with meta data',
      value: 'metaData',
      tooltip: 'Add process meta information to each page (process name, version, etc.)',
    },
    {
      label: 'A4 pages',
      value: 'a4',
      tooltip: 'Use A4 format for all pages (Scales down the process image if necessary)',
    },
    {
      label: 'with referenced processes',
      value: 'imports',
      tooltip: 'Also export all referenced processes used in call-activities',
    },
    {
      label: 'with collapsed subprocesses',
      value: 'subprocesses',
      tooltip: 'Also export content of all collapsed subprocesses',
    },
  ],
  svg: [
    {
      label: 'with referenced processes',
      value: 'imports',
      tooltip: 'Also export all referenced processes used in call-activities',
    },
    {
      label: 'with collapsed subprocesses',
      value: 'subprocesses',
      tooltip: 'Also export content of all collapsed subprocesses',
    },
  ],
  png: [
    {
      label: 'with referenced processes',
      value: 'imports',
      tooltip: 'Also export all referenced processes used in call-activities',
    },
    {
      label: 'with collapsed subprocesses',
      value: 'subprocesses',
      tooltip: 'Also export content of all collapsed subprocesses',
    },
  ],
};

type ProcessExportModalProps = {
  processes: { definitionId: string; processVersion?: number | string }[]; // the processes to export; also used to decide if the modal should be opened
  onClose: () => void;
  open: boolean;
};

const ProcessExportModal: React.FC<ProcessExportModalProps> = ({
  processes = [],
  onClose,
  open,
}) => {
  const [selectedType, setSelectedType] = useState<ProcessExportOptions['type']>();
  const [selectedOptions, setSelectedOptions] = useState<CheckboxValueType[]>(['metaData']);
  const [isExporting, setIsExporting] = useState(false);
  const [pngScalingFactor, setPngScalingFactor] = useState(1.5);

  const handleTypeSelectionChange = ({ target: { value } }: RadioChangeEvent) => {
    setSelectedType(value);
  };

  const handleOptionSelectionChange = (checkedValues: CheckboxValueType[]) => {
    setSelectedOptions(checkedValues);
  };

  const handleClose = () => {
    setIsExporting(false);
    onClose();
  };

  const handleOk = async () => {
    setIsExporting(true);
    await exportProcesses(
      {
        type: selectedType!,
        artefacts: selectedOptions.some((el) => el === 'artefacts'),
        subprocesses: selectedOptions.some((el) => el === 'subprocesses'),
        imports: selectedOptions.some((el) => el === 'imports'),
        metaData: selectedOptions.some((el) => el === 'metaData'),
        a4: selectedOptions.some((el) => el === 'a4'),
        scaling: pngScalingFactor,
      },
      processes,
    );

    handleClose();
  };

  const typeSelection = (
    <Radio.Group onChange={handleTypeSelectionChange} value={selectedType} style={{ width: '50%' }}>
      <Space direction="vertical">
        {exportTypeOptions.map(({ label, value }) => (
          <Radio value={value} key={value}>
            {label}
          </Radio>
        ))}
      </Space>
    </Radio.Group>
  );

  const optionSelection = (
    <Space direction="vertical">
      <Checkbox.Group
        onChange={handleOptionSelectionChange}
        value={selectedOptions}
        style={{ width: '100%' }}
      >
        <Space direction="vertical">
          {(selectedType ? exportSubOptions[selectedType] : []).map(({ label, value, tooltip }) => (
            <Tooltip placement="left" title={tooltip} key={label}>
              <Checkbox value={value}>{label}</Checkbox>
            </Tooltip>
          ))}
        </Space>
      </Checkbox.Group>
      {selectedType === 'png' && (
        <div style={{ marginTop: '10px' }}>
          <Tooltip placement="left" title="Export with different image resolutions">
            <span>Quality:</span>
          </Tooltip>

          <Radio.Group
            onChange={(e) => setPngScalingFactor(e.target.value)}
            value={pngScalingFactor}
          >
            <Tooltip placement="bottom" title="Smallest resolution and smallest file size">
              <Radio value={1.5}>Normal</Radio>
            </Tooltip>
            <Tooltip placement="bottom" title="Medium resolution and medium file size">
              <Radio value={2.5}>Good</Radio>
            </Tooltip>
            <Tooltip placement="bottom" title="Highest resolution and biggest file size">
              <Radio value={4}>Excellent</Radio>
            </Tooltip>
          </Radio.Group>
        </div>
      )}
    </Space>
  );

  return (
    <>
      <Modal
        title={`Export selected Processes`}
        open={open}
        onOk={handleOk}
        onCancel={handleClose}
        centered
        okButtonProps={{ disabled: !selectedType, loading: isExporting }}
        width={540}
      >
        <Flex>
          {typeSelection}
          <Divider type="vertical" style={{ height: 'auto' }} />
          {!!selectedType && optionSelection}
        </Flex>
      </Modal>
    </>
  );
};

export default ProcessExportModal;
