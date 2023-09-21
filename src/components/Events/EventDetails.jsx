import { Link, Outlet, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import Header from '../Header.jsx';
import { fetchEvent, deleteEvent, queryClient } from '../../utils/http.js';
import LoadingIndicator from '../UI/LoadingIndicator';
import ErrorBlock from '../UI/ErrorBlock';

export default function EventDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  // console.log(id);

  const { data, isPending, error, isError } = useQuery({
    queryKey: ['events', { id: id }],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });

  // if (data) {
  //   const date = new Date(data.date).toLocaleDateString('en-US', {
  //     day: 'numeric',
  //     month: 'short',
  //     year: 'numeric',
  //   });
  // }

  const {
    mutate,
    isPending: isDeletionPending,
    isError: isDeletionError,
    error: deletionError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['events'],
      });
      navigate('/events');
    },
  });

  // console.log(data);
  const deleteHandle = () => {
    mutate({ id: id });
  };

  return (
    <>
      <Outlet />
      <Header>
        <Link
          to='/events'
          className='nav-item'
        >
          View all Events
        </Link>
      </Header>
      <article id='event-details'>
        {isPending && (
          <div
            id='event-details-content'
            className='center'
          >
            <LoadingIndicator />
          </div>
        )}
        {isError && (
          <div
            id='event-details-content'
            className='center'
          >
            <ErrorBlock
              title="Couldn't fetch event"
              error={error.info?.message || 'Please try again'}
            />
          </div>
        )}
        {data && (
          <>
            <header>
              <h1>{data.title}</h1>
              <nav>
                <button onClick={deleteHandle}>Delete</button>
                <Link to='edit'>Edit</Link>
              </nav>
            </header>
            <div id='event-details-content'>
              <img
                src={`http://localhost:3000/${data.image}`}
                alt={data.title}
              />
              <div id='event-details-info'>
                <div>
                  <p id='event-details-location'>{data.location}</p>
                  <time dateTime={`Todo-DateT$Todo-Time`}>
                    {data.date} @ {data.time}
                  </time>
                </div>
                <p id='event-details-description'>{data.description}</p>
              </div>
            </div>
          </>
        )}
      </article>
    </>
  );
}
