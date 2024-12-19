import { Button } from '@mui/material';
import mainStyles from '../styles/main.module.css';
import moduleStyles from './About.module.css';
import classNames from 'classnames';
import dependencies from '../util/dependencies.json';
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatThousands } from '@shared';
import { BackToDashboardButton } from '../components/BackToDashboardButton';
import { selectSessionAdvisor } from '..';
import CompanyLogoContainer from '@/components/CompanyLogo';
import { useSelector } from 'react-redux';

const styles = {
  ...mainStyles,
  ...moduleStyles,
};

export function About() {
  const [showDependenciesList, setShowDependenciesList] = useState(false);
  const advisor = useSelector(selectSessionAdvisor);

  const handleDisplayAttributions = useCallback(() => {
    setShowDependenciesList(!showDependenciesList);
  }, [setShowDependenciesList, showDependenciesList]);

  return (
    <div className="mx-8 my-4 flex flex-col gap-2">
      <CompanyLogoContainer
        advisor={advisor}
        organizationNameClassName="text-2xl font-semibold text-darkPurple"
        subtextClassName="text-base text-darkPurple ml-4"
        containerClassName="my-4"
      />
      <BackToDashboardButton className="my-2" />
      <div className="items-start rounded-lg bg-gray-100 px-3 py-4">
        <div className="text-2xl font-semibold text-darkPurple">
          AI to personalize Long Term Care planning
        </div>
      </div>
      <div className={styles.containerContent}>
        <div className={styles.homepage}>
          <Link
            to="https://joinwaterlily.com"
            target="_blank"
          >
            joinwaterlily.com
          </Link>
        </div>
        <div className={styles.phone}>+1 (510) 239 7411</div>
        <div className={styles.socialLinks}>
          <a
            className={styles.socialLink}
            href="https://twitter.com/joinwaterlily"
            target="_blank"
            rel="noopener"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgb(69, 33, 69)"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
            </svg>
          </a>
          <a
            className={styles.socialLink}
            href="https://www.instagram.com/joinwaterlily/"
            target="_blank"
            rel="noopener"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgb(69, 33, 69)"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect
                x="2"
                y="2"
                width="20"
                height="20"
                rx="5"
                ry="5"
              ></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line
                x1="17.5"
                y1="6.5"
                x2="17.51"
                y2="6.5"
              ></line>
            </svg>
          </a>
          <a
            className={styles.socialLink}
            href="https://www.facebook.com/people/Waterlily/100082997283058/"
            target="_blank"
            rel="noopener"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgb(69, 33, 69)"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </a>
        </div>
        <div className={styles.copyright}>
          © Waterlily Caregiving 2023. All Rights Reserved.
        </div>
        <div className={styles.dependencies}>
          <Button
            onClick={handleDisplayAttributions}
            className={classNames(
              styles.buttonType6,
              styles.button,
              styles.dependencyButton,
            )}
          >
            Proudly built with the help of{' '}
            {formatThousands(dependencies.length)} open-source libraries.
          </Button>
          {showDependenciesList ? (
            <div className={styles.dependenciesList}>
              {dependencies.map(dependency => (
                <div
                  className={styles.dependency}
                  key={dependency.name}
                >
                  <div className={classNames(styles.dependencyName)}>
                    <Link
                      to={dependency.homepage}
                      target="_blank"
                      rel="noopener"
                    >
                      {dependency.name} {dependency.version}
                    </Link>
                  </div>
                  <div className={classNames(styles.dependencyDescription)}>
                    {dependency.description}
                  </div>
                  <div className={classNames(styles.dependencyAuthor)}>
                    {dependency.author}
                    {dependency.contributors?.length ? ',' : ''}
                    {dependency.contributors?.join(', ')}
                  </div>
                  <div className={classNames(styles.dependencyLicense)}>
                    {dependency.license}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
