import { useEffect, useRef, useState } from 'react';

// material-ui
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';

// assets
import { IconDotsVertical } from '@tabler/icons-react';

// ==============================|| MOBILE HEADER ||============================== //

export default function MobileSection() {
  const [open, setOpen] = useState(false);

  /**
   * anchorRef is used on different componets and specifying one type leads to other components throwing an error
   * */
  const anchorRef = useRef<any>(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  return (
    <>
      <Box component="span" ref={anchorRef} sx={{ mt: 1, ml: 1 }}>
        <IconButton sx={{ color: 'text.primary', ml: 0.5, cursor: 'pointer' }} onClick={handleToggle}>
          <IconDotsVertical
            stroke={1.5}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            style={{ fontSize: '1.5rem' }}
          />
        </IconButton>
      </Box>
    </>
  );
}
