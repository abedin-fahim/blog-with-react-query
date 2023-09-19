import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { createNewEvent, queryClient } from '../../utils/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function NewEvent() {
  const navigate = useNavigate();
  // The mutate function is a function that React Query provides to us.
  // We can use this function to trigger a mutation from anywhere in this component.
  const { mutate, isPending, isError, error } = useMutation({
    // mutationKey: ['something']
    // mutationFn unlike queryFn doesn't automatically calls the function.
    // We have to call it manually.
    mutationFn: createNewEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        // queryKey is the same as the query key we used to fetch the events.
        queryKey: ['events'],
        // exact tells React Query to only invalidate the query if the query key
        // matches exactly. By default, React Query will invalidate all queries
        // exact: true
      });
      navigate('/events');
    },
  });

  function handleSubmit(formData) {
    mutate({ event: formData });
  }

  return (
    <Modal onClose={() => navigate('../')}>
      <EventForm onSubmit={handleSubmit}>
        {isPending && <p>Submitting...</p>}
        {!isPending && (
          <>
            <Link
              to='../'
              className='button-text'
            >
              Cancel
            </Link>
            <button
              type='submit'
              className='button'
            >
              Create
            </button>
          </>
        )}
      </EventForm>
      {isError && (
        <ErrorBlock
          title='Failed to create new event'
          message={error.info?.message || 'Try again later'}
        />
      )}
    </Modal>
  );
}
