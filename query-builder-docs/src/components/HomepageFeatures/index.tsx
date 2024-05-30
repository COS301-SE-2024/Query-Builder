import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Easy to Use',
    Svg: require('@site/static/img/storage.svg').default,
    description: (
      <>
        QBEE allows non-technical users to quickly find the data that they are looking for in regular databases.
      </>
    ),
  },
  {
    title: 'Reports and Insights',
    Svg: require('@site/static/img/chart.svg').default,
    description: (
      <>
        Get insights into your data with powerful reports.
      </>
    ),
  },
  {
    title: 'Security',
    Svg: require('@site/static/img/shield.svg').default,
    description: (
      <>
        Your data is kept securely on your own servers, and only you can access it.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
