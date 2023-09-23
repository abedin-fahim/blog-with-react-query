import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { fetchEvent, updateEvent, queryClient } from '../../utils/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', { id: id }],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });

  // console.log(data);

  const { mutate } = useMutation({
    mutationFn: updateEvent,
    // Optimistic updating
    // We can update the cache before the mutation is completed
    // This is useful for a better user experience
    onMutate: async (data) => {
      const newEvent = data.event;

      await queryClient.cancelQueries({ queryKey: ['events', { id: id }] });
      const previousEvent = queryClient.getQueryData(['events', { id: id }]);

      queryClient.setQueryData(['events', { id: id }], newEvent);

      return { previousEvent };
    },
    onError: (error, data, context) => {
      queryClient.setQueryData(['events', { id: id }], context.previousEvent);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['events', { id: id }]);
    },
  });

  function handleSubmit(formData) {
    mutate({ id: id, event: formData });
    navigate('../');
  }

  function handleClose() {
    navigate('../');
  }
  let content;

  if (isPending) {
    content = (
      <div className='center'>
        <LoadingIndicator />
      </div>
    );
  }
  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Couldn't fetch event!"
          message={error.info?.message || 'Please try again'}
        />
        <div className='form-actions'>
          <Link
            to='../'
            className='button'
          >
            Okay
          </Link>
        </div>
      </>
    );
  }
  if (data) {
    content = (
      <EventForm
        inputData={data}
        onSubmit={handleSubmit}
      >
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
          Update
        </button>
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}
