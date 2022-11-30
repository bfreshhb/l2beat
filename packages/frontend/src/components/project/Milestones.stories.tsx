import { Story } from '@storybook/react'
import React from 'react'

import { Milestones, MilestonesProps } from './Milestones'

export default {
  title: 'Components/Project/Milestones',
}

function Template(props: MilestonesProps) {
  return (
    <div className="p-4">
      <Milestones {...props} />
    </div>
  )
}

export const Milestone: Story<MilestonesProps> = Template.bind({})
Milestone.args = {
  milestones: [
    {
      name: 'Creation of Arbitrum One',
      link: 'https://l2beat.com',
      date: new Date('2019-11-14'),
    },
    {
      name: 'Arbitrum Odyssey begins',
      link: 'https://l2beat.com',
      date: new Date('2022-06-25'),
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed iaculis dui eu odio aliquam, in sodales dolor lacinia. Aliquam pharetra malesuada urna turpis.',
    },
    {
      name: 'Nitro upgrade is activated',
      link: 'https://l2beat.com',
      date: new Date('2022-08-31'),
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed iaculis dui eu odio aliquam, in sodales dolor lacinia. Aliquam pharetra malesuada urna turpis.',
    },
  ],
}