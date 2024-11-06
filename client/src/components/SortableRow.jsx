import { CSS } from '@dnd-kit/utilities';
import { Button} from 'flowbite-react';
import { useSortable } from '@dnd-kit/sortable';
import { Link } from 'react-router-dom';


function SortableRow({ post, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: post._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="border-b hover:bg-slate-700 cursor-pointer grid grid-cols-6 gap-2 p-4 w-full"
    >
      <div className="flex items-center">
        <div className="w-3 h-3 bg-purple-800 rounded-full mr-2"></div>
        <Link to={`/post/${post.slug}`} className="text-teal-500 hover:underline">
          {post.title}
        </Link>
      </div>
      <div className="font-semibold text-teal-500">{post.priority}</div>
      <div>{post.deadline ? new Date(post.deadline).toLocaleDateString('en-GB') : "No deadline"}</div>
      <div>{post.subtasks ? post.subtasks.length : 0} Subtasks</div>
      <div>{post.teamName || "No team assigned"}</div>
      <div>
        <Button
          size="small"
          className="bg-red-700 p-1 rounded-3xl"
          onClick={(e) => { e.stopPropagation(); onDelete(post._id); }}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

export default SortableRow;