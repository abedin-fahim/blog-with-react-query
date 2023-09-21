import { useState } from 'react';
import { Link, Outlet, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';

import Header from '../Header.jsx';
import LoadingIndicator from '../UI/LoadingIndicator';
import ErrorBlock from '../UI/ErrorBlock';
import { fetchEvent, deleteEvent, queryClient } from '../../utils/http.js';
import Modal from '../UI/Modal.jsx';

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  // console.log(id);

  const { data, isPending, error, isError } = useQuery({
    queryKey: ['events', { id: id }],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });

  // To format the date.
  // if (data) {
  //   const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
  //     day: 'numeric',
  //     month: 'short',
  //     year: 'numeric',
  //   });
  // }
  const handleStartDelete = () => {
    setIsDeleting(true);
  };
  const handleStopDelete = () => {
    setIsDeleting(false);
  };
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
        // Disabling automatic refetch after deletion mutation
        refetchType: 'none',
      });
      navigate('/events');
    },
  });

  // console.log(data);
  const handleDelete = () => {
    mutate({ id: id });
  };

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          <h2>Are you sure you want to delete this event?</h2>
          <p>This action is irreversible. Are you sure you want to do this?</p>
          <div className='form-actions'>
            {isDeletionPending ? (
              <p>Deleting, Please wait...</p>
            ) : (
              <>
                <button
                  className='button-text'
                  onClick={handleStopDelete}
                >
                  Cancel
                </button>
                <button
                  className='button'
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </>
            )}
            {isDeletionError && (
              <ErrorBlock
                title='Failed to delete event'
                message={deletionError.info?.message || 'Please try again'}
              />
            )}
          </div>
        </Modal>
      )}
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
                <button onClick={handleStartDelete}>Delete</button>
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
