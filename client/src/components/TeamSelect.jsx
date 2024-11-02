import { Listbox, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { BsChevronExpand } from 'react-icons/bs';
import axios from 'axios';
import { useSelector } from 'react-redux';

const TeamSelect = ({ setTeam }) => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const userID = useSelector((state) => state.auth.user._id);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get(`/api/team/getTeams?userID=${userID}`);
        const data = response.data;
        if (Array.isArray(data)) {
          setTeams(data);
        } else {
          console.error("Expected an array but received:", data);
          setTeams([]);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    if (userID) {
      fetchTeams();
    }
  }, [userID]);

  const handleChange = (team) => {
    setSelectedTeam(team);
    setTeam({ id: team._id, members: team.members }); // Adjusted to use your new schema
  };

  return (
    <div>
      <p className='text-gray-700'>Select Team:</p>
      <Listbox value={selectedTeam} onChange={handleChange}>
        <div className='relative mt-1'>
          <Listbox.Button className='flex gap-4 cursor-default rounded bg-white border border-gray-300 py-2 px-3 w-full'>
            <span className='block truncate'>
              {selectedTeam ? selectedTeam.teamName : 'Select a team'}
            </span>
            <span className='pointer-events-none flex items-center'>
              <BsChevronExpand className='h-5 w-5 text-gray-400' aria-hidden='true' />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave='transition ease-in duration-100'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <Listbox.Options className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none'>
              {teams.length > 0 ? (
                teams.map((team) => (
                  <Listbox.Option
                    key={team._id}
                    value={team}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-3 pr-4 ${active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'}`
                    }
                  >
                    {({ selected }) => (
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {team.teamName}
                      </span>
                    )}
                  </Listbox.Option>
                ))
              ) : (
                <div className='py-2 px-4 text-gray-500'>No teams available</div>
              )}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export default TeamSelect;
