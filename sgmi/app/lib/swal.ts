import Swal from 'sweetalert2';

const baseToastOptions = {
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 1400,
  timerProgressBar: true,
  width: 280,
  padding: '0.5rem',
  iconColor: '#00c9a7',
  customClass: {
    popup: 'rounded-sm shadow-lg border border-gray-100',
    title: 'text-sm font-medium',
    htmlContainer: 'text-xs text-gray-700'
  },
  didOpen: (toast: HTMLElement) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
};

export const Toast = Swal.mixin(baseToastOptions);

export const ModalSwal = Swal.mixin({
  toast: false,
  width: 360,
  padding: '0.8rem',
  showConfirmButton: false,
  iconColor: '#ef4444',
  customClass: {
    popup: 'rounded-md shadow-lg',
    title: 'text-base font-semibold',
    htmlContainer: 'text-sm'
  }
});

export default Swal;
