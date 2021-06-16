import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

export function Header(): JSX.Element {
  return (
    <header className={`${commonStyles.container} ${styles.headerContainer}`}>
      <div className={commonStyles.innerContainer}>
        <img src="/logo.svg" alt="spacetraveling" width="240" />
      </div>
    </header>
  );
}
