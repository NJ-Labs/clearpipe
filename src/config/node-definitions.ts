import { NodeTypeDefinition } from '@/types/pipeline';

export const nodeTypeDefinitions: NodeTypeDefinition[] = [
  {
    type: 'dataset',
    label: 'Dataset',
    description: 'Load and configure your data source',
    icon: 'Database',
    category: 'data',
    defaultConfig: {
      source: 'local',
      path: '',
      format: 'csv',
    },
  },
  {
    type: 'versioning',
    label: 'Data Versioning',
    description: 'Version control for data and models',
    icon: 'GitBranch',
    category: 'data',
    defaultConfig: {
      tool: 'dvc',
      version: '1.0.0',
    },
  },
  {
    type: 'preprocessing',
    label: 'Preprocessing',
    description: 'Transform and prepare your data',
    icon: 'Wand2',
    category: 'processing',
    defaultConfig: {
      steps: [],
    },
  },
  {
    type: 'training',
    label: 'Model Training',
    description: 'Train ML models on cloud or local',
    icon: 'Cpu',
    category: 'training',
    defaultConfig: {
      framework: 'pytorch',
      cloudProvider: 'local',
      instanceType: 'local',
    },
  },
  {
    type: 'experiment',
    label: 'Experiment Tracking',
    description: 'Track experiments with ClearML, MLflow, W&B',
    icon: 'FlaskConical',
    category: 'tracking',
    defaultConfig: {
      tracker: 'clearml',
      projectName: '',
      experimentName: '',
      logMetrics: true,
      logArtifacts: true,
    },
  },
  {
    type: 'report',
    label: 'Model Report',
    description: 'Generate model documentation and reports',
    icon: 'FileText',
    category: 'output',
    defaultConfig: {
      title: 'Model Report',
      includeMetrics: true,
      includeVisualizations: true,
      outputFormat: 'html',
    },
  },
];

export const categoryColors: Record<string, string> = {
  data: 'bg-blue-500',
  processing: 'bg-purple-500',
  training: 'bg-orange-500',
  tracking: 'bg-green-500',
  output: 'bg-pink-500',
};

export const categoryLabels: Record<string, string> = {
  data: 'Data',
  processing: 'Processing',
  training: 'Training',
  tracking: 'Tracking',
  output: 'Output',
};

export const statusColors: Record<string, string> = {
  idle: 'bg-gray-400',
  running: 'bg-blue-500',
  completed: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-yellow-500',
};

export const cloudProviderOptions = [
  { value: 'local', label: 'Local Machine' },
  { value: 'gcp', label: 'Google Cloud Platform' },
  { value: 'aws', label: 'Amazon Web Services' },
  { value: 'azure', label: 'Microsoft Azure' },
];

export const experimentTrackerOptions = [
  { value: 'clearml', label: 'ClearML' },
  { value: 'mlflow', label: 'MLflow' },
  { value: 'wandb', label: 'Weights & Biases' },
  { value: 'comet', label: 'Comet ML' },
  { value: 'none', label: 'None' },
];

export const frameworkOptions = [
  { value: 'pytorch', label: 'PyTorch' },
  { value: 'tensorflow', label: 'TensorFlow' },
  { value: 'sklearn', label: 'Scikit-learn' },
  { value: 'xgboost', label: 'XGBoost' },
  { value: 'lightgbm', label: 'LightGBM' },
  { value: 'custom', label: 'Custom' },
];

export const dataFormatOptions = [
  { value: 'csv', label: 'CSV' },
  { value: 'parquet', label: 'Parquet' },
  { value: 'json', label: 'JSON' },
  { value: 'arrow', label: 'Apache Arrow' },
  { value: 'custom', label: 'Custom' },
];

export const dataSourceOptions = [
  { value: 'local', label: 'Local File' },
  { value: 'cloud', label: 'Cloud Storage' },
  { value: 's3', label: 'Amazon S3' },
  { value: 'gcs', label: 'Google Cloud Storage' },
  { value: 'azure-blob', label: 'Azure Blob Storage' },
  { value: 'url', label: 'URL' },
];

export const versioningToolOptions = [
  { value: 'dvc', label: 'DVC' },
  { value: 'git-lfs', label: 'Git LFS' },
  { value: 'clearml-data', label: 'ClearML Data' },
  { value: 'mlflow-artifacts', label: 'MLflow Artifacts' },
  { value: 'custom', label: 'Custom' },
];

export const preprocessingStepTypes = [
  { value: 'normalize', label: 'Normalize' },
  { value: 'standardize', label: 'Standardize' },
  { value: 'encode', label: 'Encode Categorical' },
  { value: 'impute', label: 'Impute Missing Values' },
  { value: 'feature_engineering', label: 'Feature Engineering' },
  { value: 'custom', label: 'Custom Code' },
];
