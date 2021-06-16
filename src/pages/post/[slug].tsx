import { GetStaticPaths, GetStaticProps } from 'next';

import { Fragment } from 'react';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const formattedPost = {
    first_publication_date: format(
      new Date(post.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      ...post.data,
      content: post.data.content.map(group => ({
        heading: group.heading,
        body: RichText.asHtml(group.body),
      })),
    },
  };

  let content = '';
  post.data.content.forEach(group => {
    content += RichText.asText(group.body);
  });

  const timeToRead = Math.ceil(content.split(' ').length / 200);

  return (
    <div>
      <img src={formattedPost.data.banner.url} alt="banner" width="100%" />
      <div className={`${commonStyles.innerContainer} ${styles.post}`}>
        <h1>{formattedPost.data.title}</h1>

        <div className={styles.about}>
          <span>
            <FiCalendar /> {formattedPost.first_publication_date}
          </span>
          <span>
            <FiUser /> {formattedPost.data.author}
          </span>
          <span>
            <FiClock /> {timeToRead} min
          </span>
        </div>

        {formattedPost.data.content.map(group => (
          <Fragment key={group.heading}>
            <h2>{group.heading}</h2>
            <div
              className={`${styles.postContent} ${styles.previewContent}`}
              dangerouslySetInnerHTML={{ __html: group.body }}
            />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);

  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  previewData,
}) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref || null,
  });

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(group => ({
        heading: group.heading,
        body: [...group.body],
      })),
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 30,
  };
};
