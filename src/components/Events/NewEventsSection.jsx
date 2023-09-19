import { useQuery } from '@tanstack/react-query';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import EventItem from './EventItem.jsx';
import { fetchEvents } from '../../utils/http.js';

export default function NewEventsSection() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events'],
    // React Query will automatically pass an object with the query key by default.
    queryFn: fetchEvents,
    // The staleTime option tells React Query to consider the data fresh
    // for the specified amount of time. If the data is stale, React Query
    // will automatically refetch it in the background.
    staleTime: 5000,
    //The gcTime option tells React Query to remove the data from the cache
    // after the specified amount of time.
    // gcTime: 60000,
  });
  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title='An error occurred'
        message={error.info?.message || 'Failed to fetch events'}
      />
    );
  }

  if (data) {
    content = (
      <ul className='events-list'>
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section
      className='content-section'
      id='new-events-section'
    >
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}
