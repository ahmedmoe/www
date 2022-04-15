import { Box, Link, Menu, Button, MenuButton, MenuItem, MenuList, Flex, Spacer } from '@chakra-ui/react'
import NextLink from 'next/link'
import Label from '../common/Label'

function linkGeneration(geolocation: string): string {
    return "/?Geolocation=".concat(geolocation)
}

interface StoryFilterProps {
    cities: string[]
    filter_status: string
}

export default function StoryFilter({ cities, filter_status }: StoryFilterProps) {
    return (
        ////////////////
        <Flex>
            <Box mb={2}>
                <Menu closeOnBlur={true}>
                    {({ isOpen }) => (
                        <>
                            <MenuButton as={Button} color={'white'}>
                                Filter
                            </MenuButton>
                            {isOpen &&
                                <MenuList>
                                    {cities.map((city, index) => (
                                        <MenuItem key={"filter_menu" + index}>
                                            <NextLink href={linkGeneration(city)}>
                                                <Link>{city}</Link>
                                            </NextLink>
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            }
                        </>
                    )}
                </Menu>
            </Box>
            <Spacer />
            <Box p='4'>
                <Label opaque>{"Filtering by: " + filter_status}</Label>
            </Box>
        </Flex>
    )
}
